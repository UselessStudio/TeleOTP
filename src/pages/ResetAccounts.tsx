import {FC, useContext, useState} from "react";
import {Stack, Typography} from "@mui/material";
import {StorageManagerContext} from "../managers/storage/storage.tsx";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import LottieAnimation from "../components/LottieAnimation.tsx";
import TelegramTextField from "../components/TelegramTextField.tsx";
import PasswordResetAnimation from "../assets/password_reset_lottie.json";
import {useNavigate} from "react-router-dom";

const ResetAccounts: FC = () => {
    const [phrase, setPhrase] = useState("");
    const [verified, setVerified] = useState(false);
    const storageManager = useContext(StorageManagerContext);
    const navigate = useNavigate();
    useTelegramMainButton(() => {
        if (!verified) return false;
        storageManager?.clearStorage();
        navigate("/");
        return true;
    }, "Remove PERMANENTLY", !verified);

    return <>
        <Stack spacing={2} alignItems="center">
            <LottieAnimation animationData={PasswordResetAnimation}/>
            <Typography variant="h5" fontWeight="bold" align="center">
                Password reset
            </Typography>
            <Stack>
                <Typography variant="subtitle2" align="center">
                    You are about to delete all your accounts <b>PERMANENTLY</b>. You won&apos;t be able to restore them.
                </Typography>
                <Typography variant="subtitle2" align="center">
                    If you are absolutely sure, type the phrase
                </Typography>
                <Typography variant="subtitle2" align="center" fontWeight={900}>
                    &quot;Yes, delete everything&quot;:
                </Typography>
            </Stack>
            <TelegramTextField
                fullWidth
                type="phrase"
                label="Delete your accounts and reset the password?"
                value={phrase}
                error={!verified}
                helperText={!verified ? "Type \"Yes, delete everything\"" : null}
                onChange={e => {
                    const value = e.target.value;
                    setPhrase(value);
                    setVerified(value.trim().toLowerCase() === "yes, delete everything");
                }}
            />
        </Stack>
    </>;
}

export default ResetAccounts;