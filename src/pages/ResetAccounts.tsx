import {FC, useContext, useState} from "react";
import {Stack, Typography} from "@mui/material";
import {StorageManagerContext} from "../managers/storage/storage.tsx";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import LottieAnimation from "../components/LottieAnimation.tsx";
import TelegramTextField from "../components/TelegramTextField.tsx";
import PasswordResetAnimation from "../assets/password_reset_lottie.json";
import {useNavigate} from "react-router-dom";
import {useL10n} from "../hooks/useL10n.ts";

const ResetAccounts: FC = () => {
    const [phrase, setPhrase] = useState("");
    const [verified, setVerified] = useState(false);
    const storageManager = useContext(StorageManagerContext);
    const navigate = useNavigate();
    const l10n = useL10n();

    useTelegramMainButton(() => {
        if (!verified) return false;
        storageManager?.clearStorage();
        navigate("/");
        return true;
    }, l10n("RemovePermanentlyAction"), !verified);

    return <>
        <Stack spacing={2} alignItems="center">
            <LottieAnimation animationData={PasswordResetAnimation}/>
            <Typography variant="h5" fontWeight="bold" align="center">
                {l10n("PasswordResetTitle")}
            </Typography>
            <Stack>
                <Typography variant="subtitle2" align="center">
                    {l10n("DeleteWarning")}
                </Typography>
                <Typography variant="subtitle2" align="center">
                    {l10n("TypeDeleteConfirmationPhrase")}
                </Typography>
                <Typography variant="subtitle2" align="center" fontWeight={900}>
                    &quot;{l10n("DeleteConfirmationPhrase")}&quot;:
                </Typography>
            </Stack>
            <TelegramTextField
                fullWidth
                type="phrase"
                label={l10n("DeleteConfirmationLabel")}
                value={phrase}
                error={!verified}
                helperText={!verified ? l10n("DeleteConfirmationPhraseError", {
                    phrase: l10n("DeleteConfirmationPhrase")
                }) : null}
                onChange={e => {
                    const value = e.target.value;
                    setPhrase(value);
                    setVerified(value.trim().toLowerCase() === l10n("DeleteConfirmationPhrase").toLowerCase());
                }}
            />
        </Stack>
    </>;
}

export default ResetAccounts;
