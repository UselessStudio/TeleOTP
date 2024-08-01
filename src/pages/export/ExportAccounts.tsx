import {Stack, Typography} from "@mui/material";
import LottieAnimation from "../../components/LottieAnimation.tsx";
import ExportAnimation from "../../assets/export_lottie.json";
import {FlatButton} from "../../components/FlatButton.tsx";
import {LinkOutlined, QrCode} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import {useL10n} from "../../hooks/useL10n.ts";

export default function ExportAccounts() {
    const navigate = useNavigate();
    const l10n = useL10n();

    return <Stack spacing={1} alignItems="center" justifyContent={"center"} sx={{flex: 1}}>
        <LottieAnimation animationData={ExportAnimation}/>
        <Typography variant="h5" fontWeight="bold" align="center">
            {l10n("ExportAccountsTitle")}
        </Typography>
        <Typography variant="subtitle2" align="center">
            {l10n("ExportAccountsText")}
        </Typography>
        <Stack direction="row" sx={{width: '100%', paddingTop: 1}} spacing={2}>
            <FlatButton onClick={() => { navigate("link"); }} text={l10n("Export.ViaLink")} icon={LinkOutlined}/>
            <FlatButton onClick={() => { navigate("qr"); }} text={l10n("Export.ViaQR")} icon={QrCode}/>
        </Stack>
    </Stack>;
}
