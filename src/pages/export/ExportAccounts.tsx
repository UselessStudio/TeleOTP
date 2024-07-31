import {Stack, Typography} from "@mui/material";
import LottieAnimation from "../../components/LottieAnimation.tsx";
import ExportAnimation from "../../assets/export_lottie.json";
import {FlatButton} from "../../components/FlatButton.tsx";
import {LinkOutlined, QrCode} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";

export default function ExportAccounts() {
    const navigate = useNavigate();

    return <Stack spacing={1} alignItems="center" justifyContent={"center"} sx={{flex: 1}}>
        <LottieAnimation animationData={ExportAnimation}/>
        <Typography variant="h5" fontWeight="bold" align="center">
            Export accounts
        </Typography>
        <Typography variant="subtitle2" align="center">
            You can export accounts to TeleOTP using a link, or to Google Authenticator (or similar) using a QR code.
        </Typography>
        <Stack direction="row" sx={{width: '100%', paddingTop: 1}} spacing={2}>
            <FlatButton onClick={() => { navigate("link"); }} text={"Via link"} icon={LinkOutlined}/>
            <FlatButton onClick={() => { navigate("qr"); }} text={"Via QR"} icon={QrCode}/>
        </Stack>
    </Stack>;
}
