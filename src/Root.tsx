import {Box, CircularProgress, CssBaseline, Stack, ThemeProvider} from "@mui/material";
import {Outlet, useLocation} from "react-router-dom";
import {FC, lazy, useContext} from "react";
import useTelegramBackButton from "./hooks/telegram/useTelegramBackButton.ts";
import useTelegramTheme from "./hooks/telegram/useTelegramTheme.ts";
import {EncryptionManagerContext} from "./managers/encryption.tsx";
import {StorageManagerContext} from "./managers/storage/storage.tsx";

import Decrypt from "./pages/Decrypt.tsx";
import PasswordSetup from "./pages/PasswordSetup.tsx";
const ExportAccounts = lazy(() => import("./pages/ExportAccounts.tsx"));

export function LoadingIndicator() {
    return <Stack sx={{width: '100vw', height: '100vh', position: 'fixed'}}
                  justifyContent="center"
                  alignItems="center">
        <CircularProgress/>
    </Stack>;
}

const Root: FC = () => {
    useTelegramBackButton();
    const theme = useTelegramTheme();
    const encryptionManager = useContext(EncryptionManagerContext);
    const storageManager = useContext(StorageManagerContext);

    const { search, pathname } = useLocation();

    return (
    <>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{padding: 1.5}}>
                {!encryptionManager?.storageChecked ? <LoadingIndicator/> :
                    (!encryptionManager.passwordCreated ? <PasswordSetup/> :
                        (encryptionManager.isLocked ? (pathname === "/reset" ? <Outlet/> : <Decrypt/>) :
                            (storageManager?.ready ? (search === "?export" ? <ExportAccounts/> :  <Outlet/>) :
                                <LoadingIndicator/>)))}
            </Box>
        </ThemeProvider>
    </>
  )
}

export default Root
