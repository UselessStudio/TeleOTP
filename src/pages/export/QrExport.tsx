import {CircularProgress, Stack, Typography} from "@mui/material";
import {StorageManagerContext} from "../../managers/storage/storage.tsx";
import {useContext, useEffect, useState} from "react";
import exportGoogleAuthenticator from "../../migration/export.ts";
import {useTheme} from "@mui/material/styles";
import {QRCode} from "react-qrcode-logo";
import {useNavigate} from "react-router-dom";
import useTelegramMainButton from "../../hooks/telegram/useTelegramMainButton.ts";
import {useL10n} from "../../hooks/useL10n.ts";

export default function QrExport() {
    const [qrContent, setQrContent] = useState<string | null>(null);

    const storageManager = useContext(StorageManagerContext);
    const theme = useTheme();
    useEffect(() => {
        if (!storageManager?.accounts || !storageManager.ready) return;

        const data = exportGoogleAuthenticator(storageManager.accounts);
        setQrContent("otpauth-migration://offline?data=" + encodeURIComponent(data));
    }, [storageManager?.accounts, storageManager?.ready]);

    const l10n = useL10n();
    const navigate = useNavigate();
    useTelegramMainButton(() => {
        navigate(-1);
        return true;
    }, l10n("GoBackAction"));

    return <Stack spacing={2} alignItems="center" justifyContent={"center"} sx={{flex: 1}}>
        <Typography variant="h5" fontWeight="bold" align="center">
            {l10n("ExportAccountsTitle")}
        </Typography>
        <Stack sx={{padding: 2, borderRadius: "30px", width: "75%", aspectRatio: 1}}
               alignItems="center" justifyContent="center" bgcolor="background.paper">
            {qrContent === null ? <CircularProgress/> :
                <QRCode style={{width: "100%", height: "100%"}} ecLevel={"L"}
                        logoImage={"/logo.png"}
                        fgColor={theme.palette.text.primary} bgColor={"#00000000"} quietZone={0} size={500}
                        qrStyle={"squares"} eyeRadius={5} value={qrContent}/> }
        </Stack>
        <Typography variant="subtitle2" align="center">
            {l10n("QRExportDescription")}
        </Typography>
    </Stack>;
}
