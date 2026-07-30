import {
    InsertDriveFileOutlined,
    LinkOutlined,
    QrCode,
} from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ExportAnimation from "../../assets/export_lottie.json?url";
import { FlatButton } from "../../components/FlatButton.tsx";
import LottieAnimation from "../../components/LottieAnimation.tsx";
import { useL10n } from "../../hooks/useL10n.ts";

export default function ExportAccounts() {
    const navigate = useNavigate();
    const l10n = useL10n();

    return (
        <Stack
            spacing={1}
            sx={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
            }}
        >
            <LottieAnimation animationData={ExportAnimation} />
            <Typography
                variant="h5"
                align="center"
                sx={{
                    fontWeight: "bold",
                }}
            >
                {l10n("ExportAccountsTitle")}
            </Typography>
            <Typography variant="subtitle2" align="center">
                {l10n("ExportAccountsText")}
            </Typography>
            <Stack sx={{ width: "100%", paddingTop: 1 }} spacing={1}>
                <FlatButton
                    onClick={() => navigate("file")}
                    text={l10n("Export.ViaFile")}
                    icon={InsertDriveFileOutlined}
                />
                <Stack direction="row" spacing={1}>
                    <FlatButton
                        onClick={() => {
                            navigate("link");
                        }}
                        text={l10n("Export.ViaLink")}
                        icon={LinkOutlined}
                    />
                    <FlatButton
                        onClick={() => {
                            navigate("qr");
                        }}
                        text={l10n("Export.ViaQR")}
                        icon={QrCode}
                    />
                </Stack>
            </Stack>
        </Stack>
    );
}
