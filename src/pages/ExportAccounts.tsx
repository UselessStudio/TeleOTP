import {CircularProgress, Stack} from "@mui/material";
import {StorageManagerContext} from "../managers/storage/storage.tsx";
import {useContext, useEffect} from "react";
import exportGoogleAuthenticator from "../migration/export.ts";
import {PlausibleAnalyticsContext} from "../components/PlausibleAnalytics.tsx";

export default function ExportAccounts() {
    const storageManager = useContext(StorageManagerContext);
    const analytics = useContext(PlausibleAnalyticsContext);
    useEffect(() => {
        if (!storageManager?.accounts || !storageManager.ready || !analytics) return;
        analytics.trackEvent("Account export");
        window.Telegram.WebApp.sendData(exportGoogleAuthenticator(Object.values(storageManager.accounts)));
    }, [storageManager?.accounts, storageManager?.ready, analytics]);

    return <Stack sx={{width: '100vw', height: '100vh', position: 'fixed'}}
                  justifyContent="center"
                  alignItems="center">
        <CircularProgress/>
    </Stack>;
}