import {FC, useCallback, useRef} from "react";
import {Button, Divider, Stack, Typography} from "@mui/material";
import Lottie, {LottieRefCurrentProps} from "lottie-react";
import NewAccountAnimation from "../assets/new_account_lottie.json";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import useTelegramQrScanner from "../hooks/telegram/useTelegramQrScanner.ts";
import {useNavigate} from "react-router-dom";
import {NewAccountState} from "./CreateAccount.tsx";
import {HOTP, URI} from "otpauth";

const NewAccount: FC = () => {
    const lottie = useRef<LottieRefCurrentProps | null>(null);
    const navigate = useNavigate();
    const scan = useTelegramQrScanner(useCallback((scanned) => {
        try {
            const otp = URI.parse(scanned);
            if (otp instanceof HOTP) {
                window.Telegram.WebApp.showAlert("HOTP support is not implemented yet :(");
                return;
            }
            navigate("/create", {state: {
                otp,
            } as NewAccountState});
        } catch (e) {
            window.Telegram.WebApp.showAlert("Invalid QR code");
        }
    }, [navigate]));

    return <>
        <Stack spacing={2} alignItems="center">
            <Lottie
                onClick={() => lottie.current?.goToAndPlay(0)}
                lottieRef={lottie}
                style={{width: '50%'}}
                animationData={NewAccountAnimation}
                loop={false}
            />
            <Typography variant="h5" fontWeight="bold" align="center">
                Add new account
            </Typography>
            <Typography variant="subtitle2" align="center">
                Protect your account with two-factor authentication
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