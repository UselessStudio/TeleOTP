import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { Button, Stack, Typography } from "@mui/material";
import { createRef, type Ref, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CreateAnimation from "../assets/create_lottie.json";
import IconPicker from "../components/IconPicker.tsx";
import LottieAnimation from "../components/LottieAnimation.tsx";
import TelegramTextField from "../components/TelegramTextField.tsx";
import type { Icon } from "../globals.tsx";
import useTelegramHaptics from "../hooks/telegram/useTelegramHaptics.ts";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import { useL10n } from "../hooks/useL10n.ts";
import {
    type Account,
    StorageManagerContext,
} from "../managers/storage/storage.tsx";

export interface EditAccountState {
    account: Account;
}

export default function EditAccount() {
    const navigate = useNavigate();
    const location = useLocation();
    const l10n = useL10n();
    const { notificationOccurred } = useTelegramHaptics();
    const state = location.state as EditAccountState;
    const storageManager = useContext(StorageManagerContext);

    const [issuer, setIssuer] = useState(state.account.issuer);
    const [label, setLabel] = useState(state.account.label);
    const [selectedIcon, setSelectedIcon] = useState<Icon>(state.account.icon);
    const [selectedColor, setSelectedColor] = useState<string>(
        state.account.color,
    );
    const labelInput: Ref<HTMLInputElement> = createRef();

    useTelegramMainButton(() => {
        if (!label || !labelInput.current?.checkValidity()) {
            window.Telegram.WebApp.showAlert(l10n("EmptyLabelAlert"));
            return false;
        }
        storageManager?.saveAccount({
            ...state.account,
            color: selectedColor,
            icon: selectedIcon,
            issuer,
            label,
        });
        navigate("/");
        return true;
    }, l10n("SaveAction"));

    return (
        <Stack
            spacing={2}
            sx={{
                alignItems: "center",
            }}
        >
            <LottieAnimation animationData={CreateAnimation} />
            <Typography
                variant="h5"
                align="center"
                sx={{
                    fontWeight: "bold",
                }}
            >
                {l10n("EditTitle")}
            </Typography>
            <Typography variant="subtitle2" align="center">
                {l10n("EditDescription")}
            </Typography>
            <TelegramTextField
                required
                inputRef={labelInput}
                fullWidth
                label={l10n("LabelLabel")}
                value={label}
                onChange={(e) => {
                    setLabel(e.target.value);
                }}
            />
            <TelegramTextField
                fullWidth
                label={l10n("IssuerLabel")}
                value={issuer}
                onChange={(e) => {
                    setIssuer(e.target.value);
                }}
            />
            <IconPicker
                setSelectedIcon={setSelectedIcon}
                selectedIcon={selectedIcon}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
            />
            <Button
                startIcon={<DeleteOutlinedIcon />}
                color="error"
                onClick={() => {
                    notificationOccurred("warning");
                    window.Telegram.WebApp.showPopup(
                        {
                            message: l10n("DeleteConfirmation", {
                                account: state.account.issuer
                                    ? `${state.account.issuer} (${state.account.label})`
                                    : state.account.label,
                            }),
                            buttons: [
                                {
                                    type: "destructive",
                                    text: l10n("Confirm"),
                                    id: "remove",
                                },
                                { type: "cancel", id: "cancel" },
                            ],
                        },
                        (id) => {
                            if (id !== "remove") return;
                            storageManager?.removeAccount(state.account.id);
                            navigate("/");
                        },
                    );
                }}
            >
                {l10n("DeleteAccountAction")}
            </Button>
        </Stack>
    );
}
