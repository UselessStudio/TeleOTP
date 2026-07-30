import { FileDownloadOutlined, FileUploadOutlined } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { type ChangeEvent, useContext, useRef } from "react";
import FileExportAnimation from "../../assets/file_export.json?url";
import { FlatButton } from "../../components/FlatButton.tsx";
import LottieAnimation from "../../components/LottieAnimation.tsx";
import useTelegramHaptics from "../../hooks/telegram/useTelegramHaptics.ts";
import { useL10n } from "../../hooks/useL10n.ts";
import { StorageManagerContext } from "../../managers/storage/storage.tsx";
import { decodeBackup, encodeBackup } from "../../migration/file.ts";

const MAX_BACKUP_SIZE = 10 * 1024 * 1024;
const MAX_DOWNLOAD_URL_LENGTH = 1_500_000;

function toBase64Url(data: Uint8Array): string {
    let binary = "";
    for (let offset = 0; offset < data.length; offset += 8192) {
        binary += String.fromCharCode(...data.subarray(offset, offset + 8192));
    }
    return btoa(binary)
        .replaceAll("+", "-")
        .replaceAll("/", "_")
        .replaceAll("=", "");
}

export default function FileTransfer() {
    const storageManager = useContext(StorageManagerContext);
    const inputRef = useRef<HTMLInputElement>(null);
    const l10n = useL10n();
    const { notificationOccurred } = useTelegramHaptics();

    const exportFile = () => {
        if (!storageManager || storageManager.accounts.length === 0) return;
        const data = encodeBackup(storageManager.accounts);
        const helperUrl = new URL(
            `${import.meta.env.BASE_URL}download.html`,
            window.location.origin,
        );
        helperUrl.hash = toBase64Url(data);

        if (helperUrl.href.length > MAX_DOWNLOAD_URL_LENGTH) {
            notificationOccurred("error");
            window.Telegram.WebApp.showAlert(l10n("FileExportTooLarge"));
            return;
        }

        window.Telegram.WebApp.openLink(helperUrl.href);
    };

    const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || file.size > MAX_BACKUP_SIZE || !storageManager) {
            if (file) notificationOccurred("error");
            return;
        }

        const imported = decodeBackup(new Uint8Array(await file.arrayBuffer()));
        if (!imported) {
            notificationOccurred("error");
            window.Telegram.WebApp.showAlert(l10n("FileImportInvalid"));
            return;
        }

        const existingUris = new Set(
            storageManager.accounts.map(({ uri }) => uri),
        );
        const newAccounts = imported
            .filter(({ uri }) => !existingUris.has(uri))
            .map((account, index) => ({
                ...account,
                order: storageManager.accounts.length + index,
            }));
        storageManager.saveAccounts(newAccounts);
        notificationOccurred("success");
        window.Telegram.WebApp.showAlert(
            l10n("FileImportSuccess", { count: newAccounts.length }),
        );
    };

    return (
        <Stack
            spacing={1}
            sx={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
            <LottieAnimation animationData={FileExportAnimation} />
            <Typography variant="h5" align="center" sx={{ fontWeight: "bold" }}>
                {l10n("FileTransferTitle")}
            </Typography>
            <Typography variant="subtitle2" align="center">
                {l10n("FileTransferDescription")}
            </Typography>
            <input
                ref={inputRef}
                type="file"
                accept=".teleotp,application/x-protobuf,application/octet-stream"
                hidden
                onChange={importFile}
            />
            <Stack
                direction="row"
                spacing={2}
                sx={{ width: "100%", paddingTop: 1 }}
            >
                <FlatButton
                    onClick={() => inputRef.current?.click()}
                    text={l10n("FileImportAction")}
                    icon={FileUploadOutlined}
                />
                <FlatButton
                    onClick={exportFile}
                    text={l10n("FileExportAction")}
                    icon={FileDownloadOutlined}
                    disabled={!storageManager?.accounts.length}
                />
            </Stack>
            <Typography variant="caption" align="center" color="text.secondary">
                {l10n("FileTransferWarning")}
            </Typography>
        </Stack>
    );
}
