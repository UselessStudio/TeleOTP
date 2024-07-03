import { FC, useContext } from "react";
import { ButtonBase, Link, Stack, Typography, useTheme } from "@mui/material";
import { StorageManagerContext } from "../managers/storage/storage.tsx";
import { EncryptionManagerContext } from "../managers/encryption.tsx";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { SvgIconComponent } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { SettingsManagerContext } from "../managers/settings.tsx";
import useTelegramHaptics from "../hooks/telegram/useTelegramHaptics.ts";
import {BiometricsManagerContext} from "../managers/biometrics.tsx";
import {PlausibleAnalyticsContext} from "../components/PlausibleAnalytics.tsx";
import { Link as RouterLink } from "react-router-dom";

interface OptionParams {
    onClick(): void;
    text: string;
    value?: string;
    disabled?: boolean;
    icon: SvgIconComponent;
}

const SettingsOption: FC<OptionParams> = ({ onClick,
                                              text,
                                              icon,
                                              value,
                                              disabled = false }) => {
    const theme = useTheme();
    const Icon = icon;
    return <ButtonBase
        sx={{
            textTransform: "none",
            paddingY: theme.spacing(1),
            paddingX: theme.spacing(1.5),
            width: "100%",
            bgcolor: "background.paper",
            borderRadius: "6px",
        }}
        disabled={disabled}
        onClick={onClick}
    >
        <Stack direction="row" alignItems="center" sx={{width: "100%"}} spacing={1.5}>
            <Icon color="action" />
            <Typography
                fontWeight="medium"
                color="text"
                fontSize="small"
                sx={{ flexGrow: 1 }}
                align="left"
            >
                {text}
            </Typography>
            <Typography fontWeight="800" color="primary" fontSize="small">
                {value}
            </Typography>
        </Stack>
    </ButtonBase>;
}

const Settings: FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { impactOccurred, notificationOccurred } = useTelegramHaptics();
    const biometricsManager = useContext(BiometricsManagerContext);
    const storageManager = useContext(StorageManagerContext);
    const encryptionManager = useContext(EncryptionManagerContext);
    const settingsManager = useContext(SettingsManagerContext);
    const analytics = useContext(PlausibleAnalyticsContext);
    return (
        <Stack spacing={1}>
            <Typography
                fontWeight="800"
                color="primary"
                fontSize="small"
                sx={{ paddingY: theme.spacing(0.5) }}
            >
                Security
            </Typography>
            <SettingsOption
                onClick={() => {
                    navigate("/changePassword");
                }}
                text="Password"
                value="Change"
                icon={LockOutlinedIcon}
            />

            <SettingsOption
                onClick={() => {
                    impactOccurred("light");
                    settingsManager?.setKeepUnlocked(
                        !settingsManager.shouldKeepUnlocked
                    );
                }}
                text="Keep unlocked"
                value={
                    settingsManager?.shouldKeepUnlocked ? "Enabled" : "Disabled"
                }
                icon={KeyOutlinedIcon}
            />

        <SettingsOption
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
            text="Use biometrics"
            value={
                biometricsManager?.isAvailable ? (biometricsManager.isSaved ? "Enabled" : "Disabled") : "Not available"
            }
            disabled={!biometricsManager?.isAvailable}
            icon={FingerprintIcon}/>

            <SettingsOption
                onClick={() => {
                    encryptionManager?.lock();
                }}
                text="Lock accounts"
                icon={LogoutOutlinedIcon}
            />

            <Typography
                fontWeight="800"
                color="primary"
                fontSize="small"
                sx={{ paddingY: theme.spacing(0.5) }}
            >
                Accounts
            </Typography>
            <SettingsOption
                onClick={() => {
                    navigate("/");
                }}
                text="Accounts"
                value={
                    storageManager
                        ? Object.keys(storageManager.accounts).length.toString()
                        : "0"
                }
                icon={PersonOutlineOutlinedIcon}
            />

            <SettingsOption
                onClick={() => {
                    window.Telegram.WebApp.openTelegramLink(
                        `https://t.me/${
                            import.meta.env.VITE_BOT_USERNAME
                        }?start=export`
                    );
                }}
                text="Export accounts"
                icon={FileDownloadOutlinedIcon}
            />

            <SettingsOption
                onClick={() => {
                    notificationOccurred("warning");
                    navigate("/reset");
                }}
                text="Remove all accounts"
                icon={CloseOutlinedIcon}
            />

            <Typography
                color="text.secondary"
                fontSize="small"
                align="center"
                sx={{ paddingY: theme.spacing(1) }}
            >
                TeleOTP
                <br />
                Version: {APP_VERSION}
                <br />
                <Link
                    color="inherit"
                    target="_blank"
                    rel="noopener"
                    href={APP_HOMEPAGE}
                >
                    Star us on github
                </Link>
                {import.meta.env.DEV && (
                    <>
                        <br />
                        <RouterLink color="text.secondary" style={{textDecorationColor: "unset"}} to="/devtools">
                            <Link
                                color="text.secondary"
                                target="_blank"
                                rel="noopener"
                            >
                                Dev tools
                            </Link>
                        </RouterLink>
                    </>
                )}
            </Typography>
        </Stack>
    );
};

export default Settings;
