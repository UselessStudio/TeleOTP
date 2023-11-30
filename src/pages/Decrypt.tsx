import {FC, useContext, useState} from "react";
import {Button, Stack, Typography} from "@mui/material";
import PasswordAnimation from "../assets/unlock_lottie.json";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import {EncryptionManagerContext} from "../managers/encryption.tsx";
import TelegramTextField from "../components/TelegramTextField.tsx";
import LottieAnimation from "../components/LottieAnimation.tsx";
import ClearIcon from '@mui/icons-material/Clear';
import {useNavigate} from "react-router-dom";

const Decrypt: FC = () => {
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

    const navigate = useNavigate();

    return <>
        <Stack spacing={2} alignItems="center">
            <LottieAnimation animationData={PasswordAnimation}/>
            <Typography variant="h5" fontWeight="bold" align="center">
                Decrypt your accounts
            </Typography>
            <Typography variant="subtitle2" align="center">
                Enter your decryption password to get access to your accounts
            </Typography>
            <TelegramTextField
                fullWidth
                type="password"
                label="Password"
                value={password}
                error={wrongPassword}
                helperText={wrongPassword ? "Wrong password" : null}
                onChange={e => {
                    setPassword(e.target.value);
                    setWrongPassword(false);
                }}
            />
            {wrongPassword ?
                <Button
                    startIcon={<ClearIcon />}
                    variant="text"
                    size="small"
                    sx={{width: 1}}
                    color="error"
                    onClick={() => {
                        navigate("/reset");
                    }}>
                    Reset password...
                </Button>
                : null}
        </Stack>
    </>;
}

export default Decrypt;