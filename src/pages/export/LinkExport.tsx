import {Stack, Typography} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import copyTextToClipboard from "copy-text-to-clipboard";
import LottieAnimation from "../../components/LottieAnimation.tsx";
import ExportAnimation from "../../assets/export_link_lottie.json";
import {useContext, useEffect, useState} from "react";
import {StorageManagerContext} from "../../managers/storage/storage.tsx";
import exportGoogleAuthenticator from "../../migration/export.ts";
import useTelegramMainButton from "../../hooks/telegram/useTelegramMainButton.ts";
import {useNavigate} from "react-router-dom";
import {FlatButton} from "../../components/FlatButton.tsx";


export default function LinkExport() {
    const [linkData, setLinkData] = useState<string | null>(null);
    const storageManager = useContext(StorageManagerContext);
    useEffect(() => {
        if (!storageManager?.accounts || !storageManager.ready) return;

        const data = exportGoogleAuthenticator(storageManager.accounts);
        setLinkData(data.replaceAll("+", "-")
            .replaceAll("/", "_")
            .replaceAll("=", ""))
    }, [storageManager?.accounts, storageManager?.ready]);

    const navigate = useNavigate();
    useTelegramMainButton(() => {
        navigate(-1);
        return true;
    }, "Go back");

    return <Stack spacing={2} alignItems="center" justifyContent={"center"} sx={{flex: 1}}>
        <LottieAnimation animationData={ExportAnimation}/>
        <Typography variant="h5" fontWeight="bold" align="center">
            Export link
        </Typography>
        <Stack>
            <Typography variant="subtitle2" align="center">
                Copy the link to move accounts to another Telegram user. Or just keep it, to have a backup.
            </Typography>
        </Stack>
        <FlatButton center={true} text={"Copy link"} icon={ContentCopyIcon} onClick={() => {
            copyTextToClipboard(`https://t.me/${import.meta.env.VITE_BOT_USERNAME}/${import.meta.env.VITE_APP_NAME}?startapp=${linkData}`);
        }}/>
        <Typography variant="subtitle2" align="center" color={"error"}>
            Make sure to keep it secret! Anyone can get access to your codes using this link.
        </Typography>
    </Stack>;
}