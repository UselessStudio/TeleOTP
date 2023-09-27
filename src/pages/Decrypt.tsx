import {FC, useContext, useRef, useState} from "react";
import {Stack, TextField, Typography} from "@mui/material";
import Lottie, {LottieRefCurrentProps} from "lottie-react";
import PasswordAnimation from "../assets/unlock_lottie.json";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import {EncryptionManagerContext} from "../providers/encryption.tsx";

const Decrypt: FC = () => {
    const lottie = useRef<LottieRefCurrentProps | null>(null);
    const [password, setPassword] = useState("");
    const [wrongPassword, setWrongPassword] = useState(false);
    const encryptionManager = useContext(EncryptionManagerContext);
    useTelegramMainButton(() => {
        if(encryptionManager?.unlock(password)) {
            return true;
        } else {
            setWrongPassword(true);
            return false;
        }
    }, "Decrypt");

    return <>
        <Stack spacing={2} alignItems="center">
            <Lottie
                onClick={() => lottie.current?.goToAndPlay(0)}
                lottieRef={lottie} style={{width: '50%'}}
                animationData={PasswordAnimation}
                loop={false}
            />
            <Typography variant="h5" fontWeight="bold" align="center">
                Decrypt your accounts
            </Typography>
            <Typography variant="subtitle2" align="center">
                Enter your decryption password to get access to your accounts
            </Typography>
            <TextField
                fullWidth
                type="password"
                variant="outlined"
                label="Password"
                value={password}
                error={wrongPassword}
                helperText={wrongPassword ? "Wrong password" : null}
                onChange={e => {
                    setPassword(e.target.value);
                    setWrongPassword(false);
                }}
            />
        </Stack>
    </>;
}

export default Decrypt;