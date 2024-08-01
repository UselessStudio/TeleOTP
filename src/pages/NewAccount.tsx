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
import {useL10n} from "../hooks/useL10n.ts";

const NewAccount: FC = () => {
    const navigate = useNavigate();
    const { notificationOccurred } = useTelegramHaptics();
    const storageManager = useContext(StorageManagerContext);
    const analytics = useContext(PlausibleAnalyticsContext);
    const l10n = useL10n();

    const scan = useTelegramQrScanner(useCallback((scanned) => {
        function invalidPopup() {
            window.Telegram.WebApp.showAlert(l10n("InvalidQRCodeAlert"));
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
                window.Telegram.WebApp.showAlert(l10n("HOTPUnimplementedAlert"));
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
                {l10n("NewAccountTitle")}
            </Typography>
            <Typography variant="subtitle2" align="center">
                {l10n("NewAccountDescription")}
            </Typography>
            <FlatButton center={true} text={l10n("ScanQRText")} icon={QrCodeScannerIcon} onClick={() => {
                scan()
            }}/>
            <Button fullWidth onClick={() => {
                navigate("/manual");
            }}>
                {l10n("EnterManuallyAction")}
            </Button>
        </Stack>
    </>;
}

export default NewAccount;
