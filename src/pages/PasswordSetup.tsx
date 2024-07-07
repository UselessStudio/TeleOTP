import {FC, useContext, useState} from "react";
import {Stack, Typography} from "@mui/material";
import NewPasswordAnimation from "../assets/password_lottie.json";
import ChangePasswordAnimation from "../assets/change_password_lottie.json";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import {EncryptionManagerContext} from "../managers/encryption.tsx";
import TelegramTextField from "../components/TelegramTextField.tsx";
import LottieAnimation from "../components/LottieAnimation.tsx";
import {useNavigate} from "react-router-dom";


const PasswordSetup: FC<{change?: boolean}> = ({change = false}) => {
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [notMatches, setNotMatches] = useState(false);
    const [badLength, setBadLength] = useState(false);

    const navigate = useNavigate();

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
    }, change ? "Change password" : "Create password");

    return <>
        <Stack spacing={2} alignItems="center">
            <LottieAnimation
                initialSegment={change ? [105, 285] : undefined}
                animationData={change ? ChangePasswordAnimation : NewPasswordAnimation}
            />
            <Typography variant="h5" fontWeight="bold" align="center">
                {change ? "Set new password" : "Password setup"}
            </Typography>
            <Typography variant="subtitle2" align="center">
                Enter a new encryption password to safely store your accounts
            </Typography>
            <TelegramTextField
                fullWidth
                type="password"
                label="Password"
                value={password}
                error={badLength}
                helperText={badLength ? "The password length must be 3 or more" : null}
                onChange={e => {
                    setPassword(e.target.value);
                    setNotMatches(false);
                    setBadLength(false);
                }}
            />
            <TelegramTextField
                fullWidth
                type="password"
                label="Repeat password"
                value={passwordRepeat}
                error={notMatches}
                helperText={notMatches ? "Passwords do not match" : null}
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
