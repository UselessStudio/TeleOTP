import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { useNavigate } from "react-router-dom";
import useTelegramMainButton from "../../hooks/telegram/useTelegramMainButton.ts";
import { useL10n } from "../../hooks/useL10n.ts";
import { StorageManagerContext } from "../../managers/storage/storage.tsx";
import { exportGoogleAuthenticatorBatches } from "../../migration/export.ts";

const MAX_QR_DATA_LENGTH = 500;

export default function QrExport() {
    const [qrContents, setQrContents] = useState<string[]>([]);
    const [currentQr, setCurrentQr] = useState(0);

    const storageManager = useContext(StorageManagerContext);
    useEffect(() => {
        if (!storageManager?.accounts || !storageManager.ready) return;

        setQrContents(
            exportGoogleAuthenticatorBatches(
                storageManager.accounts,
                MAX_QR_DATA_LENGTH,
                encodeURIComponent,
            ).map((data) => `otpauth-migration://offline?data=${data}`),
        );
        setCurrentQr(0);
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
            <Typography
                variant="h5"
                align="center"
                sx={{
                    fontWeight: "bold",
                }}
            >
                {l10n("ExportAccountsTitle")}
            </Typography>
            <Stack
                sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#fff",
                    padding: 2,
                    borderRadius: "30px",
                    width: "75%",
                    aspectRatio: 1,
                }}
            >
                {qrContents.length === 0 ? (
                    <CircularProgress />
                ) : (
                    <QRCode
                        style={{ width: "100%", height: "100%" }}
                        ecLevel="M"
                        fgColor="#000"
                        bgColor="#fff"
                        quietZone={16}
                        size={500}
                        qrStyle="squares"
                        value={qrContents[currentQr]}
                    />
                )}
            </Stack>
            {qrContents.length > 1 ? (
                <Stack
                    direction="row"
                    sx={{ alignItems: "center" }}
                    spacing={1}
                >
                    <IconButton
                        disabled={currentQr === 0}
                        onClick={() => setCurrentQr((index) => index - 1)}
                    >
                        <NavigateBeforeIcon />
                    </IconButton>
                    <Typography variant="subtitle2">
                        {currentQr + 1} / {qrContents.length}
                    </Typography>
                    <IconButton
                        disabled={currentQr === qrContents.length - 1}
                        onClick={() => setCurrentQr((index) => index + 1)}
                    >
                        <NavigateNextIcon />
                    </IconButton>
                </Stack>
            ) : null}
            <Typography variant="subtitle2" align="center">
                {l10n("QRExportDescription")}
                {qrContents.length > 1
                    ? `\n${l10n("QRExportBatchDescription", {
                          count: qrContents.length,
                      })}`
                    : null}
            </Typography>
        </Stack>
    );
}
