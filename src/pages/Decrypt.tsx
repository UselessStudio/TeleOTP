import { Fingerprint } from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";
import { Button, Stack, Typography } from "@mui/material";
import { type FC, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordAnimation from "../assets/unlock_lottie.json?url";
import LottieAnimation from "../components/LottieAnimation.tsx";
import PinCodeInput from "../components/PinCodeInput.tsx";
import TelegramTextField from "../components/TelegramTextField.tsx";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import { useL10n } from "../hooks/useL10n.ts";
import { BiometricsManagerContext } from "../managers/biometrics.tsx";
import { EncryptionManagerContext } from "../managers/encryption.tsx";

const Decrypt: FC = () => {
    const [password, setPassword] = useState("");
    const [wrongPassword, setWrongPassword] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const encryptionManager = useContext(EncryptionManagerContext);
    const biometricsManager = useContext(BiometricsManagerContext);
    const l10n = useL10n();

    const decryptAccounts = async () => {
        if (unlocking) return false;
        setUnlocking(true);
        if (await encryptionManager?.unlock(password)) {
            return true;
        } else {
            setUnlocking(false);
            setWrongPassword(true);
            return false;
        }
    };

    const updatePin = async (pin: string) => {
        setPassword(pin);
        setWrongPassword(false);
        if (pin.length !== 4) return;
        setUnlocking(true);
        if (!(await encryptionManager?.unlock(pin))) {
            setUnlocking(false);
            setPassword("");
            setWrongPassword(true);
        }
    };

    useTelegramMainButton(
        decryptAccounts,
        l10n("DecryptAction"),
        unlocking ||
            (encryptionManager?.credentialType === "pin" &&
                password.length !== 4),
    );

    const [biometricsRequested, setBiometricsRequested] = useState(false);
    useEffect(() => {
        if (!biometricsManager?.isSaved || biometricsRequested) return;
        setBiometricsRequested(true);
        encryptionManager?.unlockBiometrics();
    }, [
        biometricsManager,
        biometricsManager?.isSaved,
        encryptionManager,
        biometricsRequested,
    ]);

    const navigate = useNavigate();

    return (
        <Stack
            spacing={2}
            sx={{
                alignItems: "center",
            }}
        >
            <LottieAnimation animationData={PasswordAnimation} />
            <Typography
                variant="h5"
                align="center"
                sx={{
                    fontWeight: "bold",
                }}
            >
                {encryptionManager?.credentialType === "pin"
                    ? l10n("EnterPinTitle")
                    : l10n("DecryptTitle")}
            </Typography>
            <Typography variant="subtitle2" align="center">
                {l10n(
                    encryptionManager?.credentialType === "pin"
                        ? "PinUnlockDescription"
                        : "DecryptDescription",
                )}
            </Typography>
            {encryptionManager?.credentialType === "pin" ? (
                <>
                    <PinCodeInput
                        value={password}
                        error={wrongPassword}
                        disabled={unlocking}
                        onChange={(value) => void updatePin(value)}
                        onBiometrics={
                            biometricsManager?.isSaved
                                ? () => encryptionManager?.unlockBiometrics()
                                : undefined
                        }
                        biometricsLabel={l10n("UseBiometrics")}
                    />
                    {wrongPassword && (
                        <Typography color="error" variant="caption">
                            {l10n("WrongPinError")}
                        </Typography>
                    )}
                </>
            ) : (
                <TelegramTextField
                    fullWidth
                    autoFocus={true}
                    type="password"
                    label={l10n("PasswordLabel")}
                    value={password}
                    error={wrongPassword}
                    helperText={
                        wrongPassword ? l10n("WrongPasswordError") : null
                    }
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setWrongPassword(false);
                    }}
                    onSubmit={decryptAccounts}
                />
            )}
            {biometricsManager?.isSaved &&
                encryptionManager?.credentialType !== "pin" && (
                    <Button
                        size="small"
                        sx={{
                            borderRadius: 1000,
                            width: 64,
                            height: 64,
                        }}
                        onClick={() => {
                            encryptionManager?.unlockBiometrics();
                        }}
                    >
                        <Fingerprint fontSize="large" />
                    </Button>
                )}
            {wrongPassword ? (
                <Button
                    startIcon={<ClearIcon />}
                    variant="text"
                    size="small"
                    sx={{ width: 1 }}
                    color="error"
                    onClick={() => {
                        navigate("/reset");
                    }}
                >
                    {l10n(
                        encryptionManager?.credentialType === "pin"
                            ? "ResetCredentialAction"
                            : "ResetPasswordAction",
                    )}
                </Button>
            ) : null}
        </Stack>
    );
};

export default Decrypt;
