import {Box, CircularProgress, Stack, ThemeProvider} from "@mui/material";
import {Outlet} from "react-router-dom";
import {FC, useContext} from "react";
import useTelegramBackButton from "./hooks/telegram/useTelegramBackButton.ts";
import useTelegramTheme from "./hooks/telegram/useTelegramTheme.ts";
import {EncryptionManagerContext} from "./managers/encryption.tsx";
import Decrypt from "./pages/Decrypt.tsx";
import {StorageManagerContext} from "./managers/storage.tsx";
import PasswordSetup from "./pages/PasswordSetup.tsx";

function LoadingIndicator() {
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

    return (
    <>
        <ThemeProvider theme={theme}>
            <Box sx={{padding: 1.5}}>
                {!encryptionManager?.storageChecked ? <LoadingIndicator/> :
                    (!encryptionManager.passwordCreated ? <PasswordSetup/> :
                        (encryptionManager.isLocked ? <Decrypt/> :
                            (storageManager?.ready ? <Outlet/> :
                                <LoadingIndicator/>)))}
            </Box>
        </ThemeProvider>
    </>
  )
}

export default Root
