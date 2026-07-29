import {
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { type FC, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChangePasswordAnimation from "../assets/change_password_lottie.json?url";
import NewPasswordAnimation from "../assets/password_lottie.json?url";
import LottieAnimation from "../components/LottieAnimation.tsx";
import PinCodeInput from "../components/PinCodeInput.tsx";
import TelegramTextField from "../components/TelegramTextField.tsx";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import { useL10n } from "../hooks/useL10n.ts";
import {
    type CredentialType,
    EncryptionManagerContext,
} from "../managers/encryption.tsx";
import { StorageManagerContext } from "../managers/storage/storage.tsx";

const PasswordSetup: FC<{ change?: boolean }> = ({ change = false }) => {
    const encryptionManager = useContext(EncryptionManagerContext);
    const storageManager = useContext(StorageManagerContext);
    const [credentialType, setCredentialType] = useState<CredentialType>(
        change ? (encryptionManager?.credentialType ?? "password") : "password",
    );
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [pin, setPin] = useState("");
    const [firstPin, setFirstPin] = useState("");
    const [confirmingPin, setConfirmingPin] = useState(false);
    const [notMatches, setNotMatches] = useState(false);
    const [badLength, setBadLength] = useState(false);
    const [saving, setSaving] = useState(false);

    const navigate = useNavigate();
    const l10n = useL10n();

    const finish = async (value: string, type: CredentialType) => {
        if (saving) return false;
        setSaving(true);
        try {
            if (change) {
                const changed =
                    (await storageManager?.changeCredential(value, type)) ??
                    false;
                if (changed) navigate("/");
                return changed;
            }
            await encryptionManager?.createCredential(value, type);
            return true;
        } finally {
            setSaving(false);
        }
    };

    const submit = async () => {
        if (credentialType === "pin") {
            if (pin.length !== 4) return false;
            if (!confirmingPin) {
                setFirstPin(pin);
                setPin("");
                setConfirmingPin(true);
                setNotMatches(false);
                return false;
            }
            if (pin !== firstPin) {
                setPin("");
                setNotMatches(true);
                return false;
            }
            return await finish(pin, "pin");
        }

        if (password !== passwordRepeat) {
            setNotMatches(true);
            return false;
        }
        if (password.length < 3) {
            setBadLength(true);
            return false;
        }
        return await finish(password, "password");
    };

    const actionText =
        credentialType === "pin"
            ? confirmingPin
                ? l10n(change ? "ChangePinAction" : "CreatePinAction")
                : l10n("NextStepAction")
            : l10n(change ? "ChangePasswordAction" : "CreatePasswordAction");
    useTelegramMainButton(submit, actionText, saving, saving);

    const changeType = (type: CredentialType | null) => {
        if (!type) return;
        setCredentialType(type);
        setPassword("");
        setPasswordRepeat("");
        setPin("");
        setFirstPin("");
        setConfirmingPin(false);
        setNotMatches(false);
        setBadLength(false);
    };

    return (
        <Stack spacing={2} sx={{ alignItems: "center" }}>
            <LottieAnimation
                initialSegment={change ? [105, 285] : undefined}
                animationData={
                    change ? ChangePasswordAnimation : NewPasswordAnimation
                }
            />
            <Typography variant="h5" align="center" sx={{ fontWeight: "bold" }}>
                {credentialType === "pin"
                    ? confirmingPin
                        ? l10n("RepeatPinTitle")
                        : l10n("EnterPinTitle")
                    : change
                      ? l10n("ChangePasswordTitle")
                      : l10n("CreatePasswordTitle")}
            </Typography>
            <Typography variant="subtitle2" align="center">
                {l10n(
                    credentialType === "pin"
                        ? "PinSetupDescription"
                        : "PasswordSetupDescription",
                )}
            </Typography>
            <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                value={credentialType}
                onChange={(_, value: CredentialType | null) =>
                    changeType(value)
                }
            >
                <ToggleButton value="password">{l10n("Password")}</ToggleButton>
                <ToggleButton value="pin">{l10n("PinCode")}</ToggleButton>
            </ToggleButtonGroup>

            {credentialType === "pin" ? (
                <>
                    <PinCodeInput
                        value={pin}
                        error={notMatches}
                        disabled={saving}
                        onChange={(value) => {
                            setPin(value);
                            setNotMatches(false);
                        }}
                    />
                    {notMatches && (
                        <Typography color="error" variant="caption">
                            {l10n("PinRepeatIncorrectError")}
                        </Typography>
                    )}
                </>
            ) : (
                <>
                    <TelegramTextField
                        fullWidth
                        type="password"
                        label={l10n("PasswordLabel")}
                        value={password}
                        disabled={saving}
                        error={badLength}
                        helperText={
                            badLength ? l10n("PasswordRequirementError") : null
                        }
                        onChange={(event) => {
                            setPassword(event.target.value);
                            setNotMatches(false);
                            setBadLength(false);
                        }}
                    />
                    <TelegramTextField
                        fullWidth
                        type="password"
                        label={l10n("RepeatPasswordLabel")}
                        value={passwordRepeat}
                        disabled={saving}
                        error={notMatches}
                        helperText={
                            notMatches
                                ? l10n("PasswordRepeatIncorrectError")
                                : null
                        }
                        onChange={(event) => {
                            setPasswordRepeat(event.target.value);
                            setNotMatches(false);
                            setBadLength(false);
                        }}
                    />
                </>
            )}
        </Stack>
    );
};

export default PasswordSetup;
