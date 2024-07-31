import {FC, useCallback, useContext} from "react";
import {Button, Stack, Typography} from "@mui/material";
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
import {PlausibleAnalyticsContext} from "../components/PlausibleAnalytics.tsx";
import {FlatButton} from "../components/FlatButton.tsx";

const NewAccount: FC = () => {
    const navigate = useNavigate();
    const { notificationOccurred } = useTelegramHaptics();
    const storageManager = useContext(StorageManagerContext);
    const analytics = useContext(PlausibleAnalyticsContext);

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
            analytics?.trackEvent("Accounts imported from QR");
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
            <FlatButton center={true} text={"Scan QR code"} icon={QrCodeScannerIcon} onClick={() => {
                scan()
            }}/>
            <Button fullWidth onClick={() => {
                navigate("/manual");
            }}>
                Enter manually
            </Button>
        </Stack>
    </>;
}

export default NewAccount;
