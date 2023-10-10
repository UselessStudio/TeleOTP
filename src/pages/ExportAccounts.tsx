import {CircularProgress, Stack} from "@mui/material";
import {StorageManagerContext} from "../managers/storage.tsx";
import {useContext, useEffect} from "react";
import exportGoogleAuthenticator from "../migration/export.ts";

export default function ExportAccounts() {
    const storageManager = useContext(StorageManagerContext);
    useEffect(() => {
        if (!storageManager?.accounts || !storageManager.ready) return;
        window.Telegram.WebApp.sendData(exportGoogleAuthenticator(Object.values(storageManager.accounts)));
    }, [storageManager?.accounts, storageManager?.ready]);

    return <Stack sx={{width: '100vw', height: '100vh', position: 'fixed'}}
                  justifyContent="center"
                  alignItems="center">
        <CircularProgress/>
    </Stack>;
}