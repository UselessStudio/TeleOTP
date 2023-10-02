import {FC, useContext, useState} from "react";
import {Stack, Typography} from "@mui/material";
import NewPasswordAnimation from "../assets/password_lottie.json";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import {EncryptionManagerContext} from "../providers/encryption.tsx";
import TelegramTextField from "../components/TelegramTextField.tsx";
import LottieAnimation from "../components/LottieAnimation.tsx";

const PasswordSetup: FC = () => {
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [notMatches, setNotMatches] = useState(false);

    const encryptionManager = useContext(EncryptionManagerContext);
    useTelegramMainButton(() => {
        if (password !== passwordRepeat) {
            setNotMatches(true);
            return false;
        }
        encryptionManager?.createPassword(password);
        return false;
    }, "Create password");

    return <>
        <Stack spacing={2} alignItems="center">
            <LottieAnimation animationData={NewPasswordAnimation}/>
            <Typography variant="h5" fontWeight="bold" align="center">
                Password setup
            </Typography>
            <Typography variant="subtitle2" align="center">
                Enter a new encryption password to safely store your accounts
            </Typography>
            <TelegramTextField
                fullWidth
                type="password"
                label="Password"
                value={password}
                onChange={e => {
                    setPassword(e.target.value);
                    setNotMatches(false);
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
                }}
            />
        </Stack>
    </>;
}

export default PasswordSetup;