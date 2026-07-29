import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Stack, Typography } from "@mui/material";
import copyTextToClipboard from "copy-text-to-clipboard";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExportAnimation from "../../assets/export_link_lottie.json?url";
import { FlatButton } from "../../components/FlatButton.tsx";
import LottieAnimation from "../../components/LottieAnimation.tsx";
import useTelegramMainButton from "../../hooks/telegram/useTelegramMainButton.ts";
import { useL10n } from "../../hooks/useL10n.ts";
import { StorageManagerContext } from "../../managers/storage/storage.tsx";
import { exportGoogleAuthenticatorBatches } from "../../migration/export.ts";

const MAX_STARTAPP_LENGTH = 512;

export default function LinkExport() {
    const [links, setLinks] = useState<string[]>([]);
    const storageManager = useContext(StorageManagerContext);
    useEffect(() => {
        if (!storageManager?.accounts || !storageManager.ready) return;

        setLinks(
            exportGoogleAuthenticatorBatches(
                storageManager.accounts,
                MAX_STARTAPP_LENGTH,
            ).map(
                (data) =>
                    `https://t.me/${import.meta.env.VITE_BOT_USERNAME}/${import.meta.env.VITE_APP_NAME}?startapp=${data}`,
            ),
        );
    }, [storageManager?.accounts, storageManager?.ready]);

    const l10n = useL10n();
    const navigate = useNavigate();
    useTelegramMainButton(() => {
        navigate(-1);
        return true;
    }, l10n("GoBackAction"));

    return (
        <Stack
            spacing={2}
            sx={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
            }}
        >
            <LottieAnimation animationData={ExportAnimation} />
            <Typography
                variant="h5"
                align="center"
                sx={{
                    fontWeight: "bold",
                }}
            >
                {l10n("LinkExportTitle")}
            </Typography>
            <Stack>
                <Typography variant="subtitle2" align="center">
                    {l10n("LinkExportDescription")}
                </Typography>
                {links.length > 1 ? (
                    <Typography variant="subtitle2" align="center">
                        {l10n("LinkExportBatchDescription", {
                            count: links.length,
                        })}
                    </Typography>
                ) : null}
            </Stack>
            <FlatButton
                center={true}
                text={l10n("CopyLinkAction")}
                icon={ContentCopyIcon}
                onClick={() => {
                    if (links.length > 0) copyTextToClipboard(links.join("\n"));
                }}
            />
            <Typography variant="subtitle2" align="center" color={"error"}>
                {l10n("LinkExportSecretWarning")}
            </Typography>
        </Stack>
    );
}
