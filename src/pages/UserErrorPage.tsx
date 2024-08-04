import {FC, useContext, useEffect, useState} from "react";
import {useLocation, useRouteError} from "react-router-dom";
import {CssBaseline, Stack, ThemeProvider, Typography} from "@mui/material";
import LottieAnimation from "../components/LottieAnimation.tsx";
import CrashAnimation from "../assets/crash_lottie.json";
import {FlatButton} from "../components/FlatButton.tsx";
import BugReportIcon from '@mui/icons-material/BugReport';
import ReplyIcon from '@mui/icons-material/Reply';
import useTelegramTheme from "../hooks/telegram/useTelegramTheme.ts";
import {EncryptionManagerContext} from "../managers/encryption.tsx";
import copyTextToClipboard from "copy-text-to-clipboard";
import {StorageManagerContext} from "../managers/storage/storage.tsx";
import {SettingsManagerContext} from "../managers/settings.tsx";
import {LocalizationManagerContext} from "../managers/localization.tsx";

async function uploadPaste(content: string) {
    const paste = await window.fetch("https://api.pastes.dev/post", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: content,
    });

    return `https://pastes.dev/${(await paste.json()).key}`;
}

const UserErrorPage: FC = () => {
    const error = useRouteError() as Error | undefined;
    const tgTheme = useTelegramTheme();
    const location = useLocation();

    const encryption = useContext(EncryptionManagerContext);
    const storage = useContext(StorageManagerContext);
    const settings = useContext(SettingsManagerContext);
    const localization = useContext(LocalizationManagerContext);
    const [time, setTime] = useState(0);
    useEffect(() => {
        setTime(performance.now())
    }, []);

    return <ThemeProvider theme={tgTheme}>
        <CssBaseline />
        <Stack spacing={1} alignItems="center" justifyContent={"center"} sx={{flex: 1, padding: 2}}>
            <LottieAnimation animationData={CrashAnimation}/>
            <Typography variant="h5" fontWeight="bold" align="center">
                Oops! TeleOTP has crashed
            </Typography>
            <Typography variant="subtitle2" align="center">
                Please send us debug information so we can work on a fix.
            </Typography>
            <br/>
            <FlatButton center={true} onClick={() => {
                void uploadPaste(JSON.stringify({
                    error: error ? JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))) : error,
                    telegram: {
                        version: window.Telegram.WebApp.version,
                        userId: window.Telegram.WebApp.initDataUnsafe.user?.id
                    },
                    time,
                    path: location.pathname,
                    href: window.location.href,
                    managers: {
                        encryption: encryption ? {
                            isLocked: encryption.isLocked,
                            storageChecked: encryption.storageChecked,
                            passwordCreated: encryption.passwordCreated,
                        } : null,
                        storage: storage ? {
                            ready: storage.ready,
                            accounts: storage.accounts.length,
                        } : null,
                        settings: settings ? {
                            language: settings.selectedLanguage,
                            lastAccount: settings.lastSelectedAccount,
                        } : null,
                        localization: !!localization,
                    }
                }, null, 4)).then(paste => {
                    copyTextToClipboard(paste);
                });
            }} text={"Copy debug information"} icon={BugReportIcon}/>

            <FlatButton center={true} onClick={() => {
                window.Telegram.WebApp.openTelegramLink(import.meta.env.VITE_CHANNEL_LINK);
            }} text={"Open channel"} icon={ReplyIcon}/>
        </Stack>
    </ThemeProvider>;
}

export default UserErrorPage;
