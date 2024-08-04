import {FC, useContext, useEffect, useState} from "react";
import {Button, Stack, Typography} from "@mui/material";
import PasswordAnimation from "../assets/unlock_lottie.json";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import {EncryptionManagerContext} from "../managers/encryption.tsx";
import TelegramTextField from "../components/TelegramTextField.tsx";
import LottieAnimation from "../components/LottieAnimation.tsx";
import ClearIcon from '@mui/icons-material/Clear';
import {useNavigate} from "react-router-dom";
import {BiometricsManagerContext} from "../managers/biometrics.tsx";
import { Fingerprint } from "@mui/icons-material";
import {useL10n} from "../hooks/useL10n.ts";

const Decrypt: FC = () => {
    const [password, setPassword] = useState("");
    const [wrongPassword, setWrongPassword] = useState(false);
    const encryptionManager = useContext(EncryptionManagerContext);
    const biometricsManager = useContext(BiometricsManagerContext);
    const l10n = useL10n();

    const decryptAccounts = () => {
        if(encryptionManager?.unlock(password)) {
            return true;
        } else {
            setWrongPassword(true);
            return false;
        }
    }

    useTelegramMainButton(decryptAccounts, l10n("DecryptAction"));

    const [biometricsRequested, setBiometricsRequested] = useState(false);
    useEffect(() => {
        if(!biometricsManager?.isSaved || biometricsRequested) return;
        setBiometricsRequested(true);
        encryptionManager?.unlockBiometrics();
    }, [biometricsManager, biometricsManager?.isSaved, encryptionManager, biometricsRequested]);

    const navigate = useNavigate();

    return <>
        <Stack spacing={2} alignItems="center">
            <LottieAnimation animationData={PasswordAnimation}/>
            <Typography variant="h5" fontWeight="bold" align="center">
                {l10n("DecryptTitle")}
            </Typography>
            <Typography variant="subtitle2" align="center">
                {l10n("DecryptDescription")}
            </Typography>
            <TelegramTextField
                fullWidth
                autoFocus={true}
                type="password"
                label={l10n("PasswordLabel")}
                value={password}
                error={wrongPassword}
                helperText={wrongPassword ? l10n("WrongPasswordError") : null}
                onChange={e => {
                    setPassword(e.target.value);
                    setWrongPassword(false);
                }}
                onSubmit={decryptAccounts}
            />
            {biometricsManager?.isSaved  && 
                <Button
                    size="small"
                    sx={{
                        borderRadius: 1000,
                        width: 64,
                        height: 64,
                    }}
                    onClick={() => {encryptionManager?.unlockBiometrics()}}
                >
                    <Fingerprint fontSize="large" />
                </Button>
            }
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
                    {l10n("ResetPasswordAction")}
                </Button>
                : null}
        </Stack>
    </>;
}

export default Decrypt;
