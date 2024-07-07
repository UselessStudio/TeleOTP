import {FC, useCallback, useContext} from "react";
import {Button, Divider, Stack, Typography} from "@mui/material";
import NewAccountAnimation from "../assets/new_account_lottie.json";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import useTelegramQrScanner from "../hooks/telegram/useTelegramQrScanner.ts";
import {useNavigate} from "react-router-dom";
import {NewAccountState} from "./CreateAccount.tsx";
import {HOTP, URI} from "otpauth";
import LottieAnimation from "../components/LottieAnimation.tsx";
import decodeGoogleAuthenticator from "../migration/import.ts";
import useTelegramHaptics from "../hooks/telegram/useTelegramHaptics.ts";
import {StorageManagerContext} from "../managers/storage/storage.tsx";

const NewAccount: FC = () => {
    const navigate = useNavigate();
    const { notificationOccurred } = useTelegramHaptics();
    const storageManager = useContext(StorageManagerContext);

    const scan = useTelegramQrScanner(useCallback((scanned) => {
        function invalidPopup() {
            window.Telegram.WebApp.showAlert("Invalid QR code");
            notificationOccurred("error");
        }

        if (scanned.startsWith("otpauth://")) {
            let otp;
            try {
                otp = URI.parse(scanned);
            } catch (e) {
                invalidPopup();
                return;
            }

            if (otp instanceof HOTP) {
                // TODO implement HOTP
                window.Telegram.WebApp.showAlert("HOTP support is not implemented yet :(");
                notificationOccurred("error");
                return;
            }
            navigate("/create", {state: {
                    otp,
                } as NewAccountState});
        } else if (scanned.startsWith("otpauth-migration://offline")) {
            const accounts = decodeGoogleAuthenticator(scanned);
            if (accounts === null) {
                invalidPopup();
                return;
            }

            storageManager?.saveAccounts(accounts);
            navigate("/");
        } else {
            invalidPopup();
        }

    }, [navigate, notificationOccurred]));

    return <>
        <Stack spacing={2} alignItems="center">
            <LottieAnimation animationData={NewAccountAnimation}/>
            <Typography variant="h5" fontWeight="bold" align="center">
                Add new account
            </Typography>
            <Typography variant="subtitle2" align="center">
                Protect your account with two-factor authentication (Google Authenticator import is also supported)
            </Typography>
            <Button fullWidth variant="contained" startIcon={<QrCodeScannerIcon/>} onClick={() => {
                scan()
            }}>
                Scan QR code
            </Button>
            <Divider sx={{width: '100%'}}>
                <Typography>OR</Typography>
            </Divider>
            <Button fullWidth onClick={() => {
                navigate("/manual");
            }}>
                Enter manually
            </Button>
        </Stack>
    </>;
}

export default NewAccount;
