import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { Button, Stack, Typography } from "@mui/material";
import { HOTP, URI } from "otpauth";
import { type FC, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import NewAccountAnimation from "../assets/new_account_lottie.json";
import { FlatButton } from "../components/FlatButton.tsx";
import LottieAnimation from "../components/LottieAnimation.tsx";
import { PlausibleAnalyticsContext } from "../components/PlausibleAnalytics.tsx";
import useTelegramHaptics from "../hooks/telegram/useTelegramHaptics.ts";
import useTelegramQrScanner from "../hooks/telegram/useTelegramQrScanner.ts";
import { useL10n } from "../hooks/useL10n.ts";
import { StorageManagerContext } from "../managers/storage/storage.tsx";
import decodeGoogleAuthenticator from "../migration/import.ts";
import type { NewAccountState } from "./CreateAccount.tsx";

const NewAccount: FC = () => {
    const navigate = useNavigate();
    const { notificationOccurred } = useTelegramHaptics();
    const storageManager = useContext(StorageManagerContext);
    const analytics = useContext(PlausibleAnalyticsContext);
    const l10n = useL10n();

    const scan = useTelegramQrScanner(
        useCallback(
            (scanned) => {
                function invalidPopup() {
                    window.Telegram.WebApp.showAlert(
                        l10n("InvalidQRCodeAlert"),
                    );
                    notificationOccurred("error");
                }

                if (scanned.startsWith("otpauth://")) {
                    let otp: ReturnType<typeof URI.parse>;
                    try {
                        otp = URI.parse(scanned);
                    } catch (_e) {
                        invalidPopup();
                        return;
                    }

                    if (otp instanceof HOTP) {
                        // TODO implement HOTP
                        window.Telegram.WebApp.showAlert(
                            l10n("HOTPUnimplementedAlert"),
                        );
                        notificationOccurred("error");
                        return;
                    }
                    navigate("/create", {
                        state: {
                            otp,
                        } as NewAccountState,
                    });
                } else if (scanned.startsWith("otpauth-migration://offline")) {
                    const accounts = decodeGoogleAuthenticator(scanned);
                    if (accounts === null) {
                        invalidPopup();
                        return;
                    }

                    storageManager?.saveAccounts(accounts);
                    analytics?.trackEvent("Accounts imported from QR");
                    navigate("/");
                } else {
                    invalidPopup();
                }
            },
            [
                navigate,
                notificationOccurred,
                storageManager?.saveAccounts,
                l10n,
                analytics?.trackEvent,
            ],
        ),
    );

    return (
        <Stack
            spacing={2}
            sx={{
                alignItems: "center",
            }}
        >
            <LottieAnimation animationData={NewAccountAnimation} />
            <Typography
                variant="h5"
                align="center"
                sx={{
                    fontWeight: "bold",
                }}
            >
                {l10n("NewAccountTitle")}
            </Typography>
            <Typography variant="subtitle2" align="center">
                {l10n("NewAccountDescription")}
            </Typography>
            <FlatButton
                center={true}
                text={l10n("ScanQRText")}
                icon={QrCodeScannerIcon}
                onClick={() => {
                    scan();
                }}
            />
            <Button
                fullWidth
                onClick={() => {
                    navigate("/manual");
                }}
            >
                {l10n("EnterManuallyAction")}
            </Button>
        </Stack>
    );
};

export default NewAccount;
