import {FC, useContext, useState} from "react";
import {Stack, Typography} from "@mui/material";
import NewPasswordAnimation from "../assets/password_lottie.json";
import ChangePasswordAnimation from "../assets/change_password_lottie.json";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import {EncryptionManagerContext} from "../managers/encryption.tsx";
import TelegramTextField from "../components/TelegramTextField.tsx";
import LottieAnimation from "../components/LottieAnimation.tsx";
import {useNavigate} from "react-router-dom";
import {useL10n} from "../hooks/useL10n.ts";


const PasswordSetup: FC<{change?: boolean}> = ({change = false}) => {
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [notMatches, setNotMatches] = useState(false);
    const [badLength, setBadLength] = useState(false);

    const navigate = useNavigate();
    const l10n = useL10n();

    const encryptionManager = useContext(EncryptionManagerContext);
    useTelegramMainButton(() => {
        if (password !== passwordRepeat) {
            setNotMatches(true);
            return false;
        }

        if (password.length < 3) {
            setBadLength(true);
            return false;
        }

        encryptionManager?.createPassword(password);
        if (change) {
            navigate("/");
        }

        return true;
    }, change ? l10n("ChangePasswordAction") : l10n("CreatePasswordAction"));

    return <>
        <Stack spacing={2} alignItems="center">
            <LottieAnimation
                initialSegment={change ? [105, 285] : undefined}
                animationData={change ? ChangePasswordAnimation : NewPasswordAnimation}
            />
            <Typography variant="h5" fontWeight="bold" align="center">
                {change ? l10n("ChangePasswordTitle") : l10n("CreatePasswordTitle")}
            </Typography>
            <Typography variant="subtitle2" align="center">
                {l10n("PasswordSetupDescription")}
            </Typography>
            <TelegramTextField
                fullWidth
                type="password"
                label={l10n("PasswordLabel")}
                value={password}
                error={badLength}
                helperText={badLength ? l10n("PasswordRequirementError") : null}
                onChange={e => {
                    setPassword(e.target.value);
                    setNotMatches(false);
                    setBadLength(false);
                }}
            />
            <TelegramTextField
                fullWidth
                type="password"
                label={l10n("RepeatPasswordLabel")}
                value={passwordRepeat}
                error={notMatches}
                helperText={notMatches ? l10n("PasswordRepeatIncorrectError") : null}
                onChange={e => {
                    setPasswordRepeat(e.target.value);
                    setNotMatches(false);
                    setBadLength(false);
                }}
            />
        </Stack>
    </>;
}

export default PasswordSetup;
