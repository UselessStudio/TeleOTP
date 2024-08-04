import {FC, useContext} from "react";
import {Link, Stack, Typography, useTheme} from "@mui/material";
import {StorageManagerContext} from "../managers/storage/storage.tsx";
import {EncryptionManagerContext} from "../managers/encryption.tsx";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import {Newspaper, Language} from "@mui/icons-material";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import {SettingsManagerContext} from "../managers/settings.tsx";
import useTelegramHaptics from "../hooks/telegram/useTelegramHaptics.ts";
import {BiometricsManagerContext} from "../managers/biometrics.tsx";
import {PlausibleAnalyticsContext} from "../components/PlausibleAnalytics.tsx";
import {FlatButton} from "../components/FlatButton.tsx";
import {useL10n} from "../hooks/useL10n.ts";
import {defaultLanguage, languageDescriptions} from "../globals.tsx";

const Settings: FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { impactOccurred, notificationOccurred } = useTelegramHaptics();
    const biometricsManager = useContext(BiometricsManagerContext);
    const storageManager = useContext(StorageManagerContext);
    const encryptionManager = useContext(EncryptionManagerContext);
    const settingsManager = useContext(SettingsManagerContext);
    const analytics = useContext(PlausibleAnalyticsContext);
    const l10n = useL10n();

    return (
        <Stack spacing={1}>
            <Typography
                fontWeight="800"
                color="primary"
                fontSize="small"
                sx={{ paddingY: theme.spacing(0.5) }}
            >
                {l10n("Settings.General")}
            </Typography>
            <FlatButton
                onClick={() => {
                    navigate("lang");
                }}
                text={l10n("Language")}
                icon={Language}
                value={languageDescriptions[settingsManager?.selectedLanguage ?? defaultLanguage].native}
            />
            <FlatButton
                onClick={() => {
                    window.Telegram.WebApp.openTelegramLink(import.meta.env.VITE_CHANNEL_LINK);
                }}
                text={l10n("NewsChannel")}
                value={l10n("ActionOpen")}
                icon={Newspaper}
            />

            <Typography
                fontWeight="800"
                color="primary"
                fontSize="small"
                sx={{ paddingY: theme.spacing(0.5) }}
            >
                {l10n("Settings.Security")}
            </Typography>
            <FlatButton
                onClick={() => {
                    navigate("/changePassword");
                }}
                text={l10n("Password")}
                value={l10n("ActionChange")}
                icon={LockOutlinedIcon}
            />

        <FlatButton
            onClick={() => {
                impactOccurred("light");
                settingsManager?.setKeepUnlocked(!settingsManager.shouldKeepUnlocked);
            }}
            text={l10n("KeepUnlocked")}
            value={settingsManager?.shouldKeepUnlocked ? l10n("Enabled") : l10n("Disabled")}
            icon={KeyOutlinedIcon}/>

        <FlatButton
            onClick={() => {
                if(!biometricsManager?.isAvailable) {
                    notificationOccurred("error");
                    return;
                }
                impactOccurred("light");
                if(biometricsManager.isSaved) {
                    encryptionManager?.removeBiometricToken();
                } else {
                    encryptionManager?.saveBiometricToken();
                    analytics?.trackEvent("Biometrics enabled");
                }
            }}
            text={l10n("UseBiometrics")}
            value={
                biometricsManager?.isAvailable ? (biometricsManager.isSaved ? l10n("Enabled") : l10n("Disabled")) : l10n("NotAvailable")
            }
            disabled={!biometricsManager?.isAvailable}
            icon={FingerprintIcon}/>

            <FlatButton
                onClick={() => {
                    encryptionManager?.lock();
                }}
                text={l10n("LockAccounts")}
                icon={LogoutOutlinedIcon}
            />

            <Typography
                fontWeight="800"
                color="primary"
                fontSize="small"
                sx={{ paddingY: theme.spacing(0.5) }}
            >
                {l10n("Settings.Accounts")}
            </Typography>
            <FlatButton
                onClick={() => {
                    navigate("/");
                }}
                text={l10n("Accounts")}
                value={
                    storageManager
                        ? storageManager.accounts.length.toString()
                        : "0"
                }
                icon={PersonOutlineOutlinedIcon}
            />

            <FlatButton
                onClick={() => {
                    navigate("/export");
                    // window.Telegram.WebApp.openTelegramLink(
                    //     `https://t.me/${
                    //         import.meta.env.VITE_BOT_USERNAME
                    //     }?start=export`
                    // );
                }}
                text={l10n("ActionExportAccounts")}
                icon={FileDownloadOutlinedIcon}
            />

            <FlatButton
                onClick={() => {
                    notificationOccurred("warning");
                    navigate("/reset");
                }}
                text={l10n("ActionRemoveAccounts")}
                icon={CloseOutlinedIcon}
            />

            <Typography
                color="text.secondary"
                fontSize="small"
                align="center"
                sx={{paddingY: theme.spacing(1)}}
            >
                TeleOTP
                <br/>
                {l10n("Version")}: {APP_VERSION}
                <br/>
                <Link
                    color="inherit"
                    target="_blank"
                    rel="noopener"
                    href={APP_HOMEPAGE}
                >
                    {l10n("StarUs")}
                </Link>
                <br/>
                <Link
                    color="inherit"
                    target="_blank"
                    rel="noopener"
                    href={import.meta.env.VITE_TRANSLATE_LINK}
                >
                    {l10n("HelpTranslating")}
                </Link>
                {import.meta.env.DEV && (
                    <>
                        <br/>
                        <RouterLink style={{color: "inherit"}} to="/devtools">
                            {l10n("DevTools")}
                        </RouterLink>
                    </>
                )}
            </Typography>
        </Stack>
    );
};

export default Settings;
