import {Stack, Typography} from "@mui/material";
import {Ref, createRef, useContext, useState} from "react";
import CreateAnimation from "../assets/create_lottie.json";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import {TOTP} from "otpauth";
import {useLocation, useNavigate} from "react-router-dom";
import IconPicker from "../components/IconPicker.tsx";
import TelegramTextField from "../components/TelegramTextField.tsx";
import {StorageManagerContext} from "../managers/storage/storage.tsx";
import {nanoid} from "nanoid";
import {Icon} from "../globals.tsx";
import LottieAnimation from "../components/LottieAnimation.tsx";
import {SettingsManagerContext} from "../managers/settings.tsx";
import {PlausibleAnalyticsContext} from "../components/PlausibleAnalytics.tsx";
import {useL10n} from "../hooks/useL10n.ts";

export interface NewAccountState {
    otp: TOTP,
    icon?: string,
    color?: string,
}

export default function CreateAccount() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as NewAccountState;
    const storageManager = useContext(StorageManagerContext);
    const settingsManager = useContext(SettingsManagerContext);
    const analytics = useContext(PlausibleAnalyticsContext);

    const [id] = useState(nanoid());
    const [issuer, setIssuer] = useState(state.otp.issuer);
    const [label, setLabel] = useState(state.otp.label);
    const [selectedIcon, setSelectedIcon] = useState<Icon>(state.icon ?? "key");
    const [selectedColor, setSelectedColor] = useState<string>(state.color ?? "#1c98e6");
    const labelInput: Ref<HTMLInputElement> = createRef();
    const l10n = useL10n();

    useTelegramMainButton(() => {
        if (!label && !labelInput.current?.checkValidity()) {
            window.Telegram.WebApp.showAlert(l10n("EmptyLabelAlert"));
            return false;
        }
        analytics?.trackEvent("New account");
        storageManager?.saveAccount({
            id,
            color: selectedColor,
            icon: selectedIcon,
            issuer,
            label,
            uri: state.otp.toString(),
            order: storageManager.lastOrder() + 1,
        });
        import.meta.env.DEV && console.log("order", storageManager?.lastOrder())
        settingsManager?.setLastSelectedAccount(id);
        navigate("/");
        return true;
    }, l10n("CreateAction"));

    return <Stack spacing={2} alignItems="center">
        <LottieAnimation animationData={CreateAnimation}/>
        <Typography variant="h5" fontWeight="bold" align="center">
            {l10n("NewAccountTitle")}
        </Typography>
        <Typography variant="subtitle2" align="center">
            {l10n("AdditionalInfo")}
        </Typography>
        <TelegramTextField
            fullWidth
            label={`${l10n("LabelLabel")} ${l10n("RequiredLabel")}`}
            value={label}
            onChange={e => {
                state.otp.label = e.target.value;
                setLabel(e.target.value);
            }}
        />
        <TelegramTextField
            fullWidth
            label={l10n("IssuerLabel")}
            value={issuer}
            onChange={e => {
                state.otp.issuer = e.target.value;
                setIssuer(e.target.value);
            }}
        />
        <IconPicker setSelectedIcon={setSelectedIcon} selectedIcon={selectedIcon} selectedColor={selectedColor} setSelectedColor={setSelectedColor}/>
    </Stack>;
}
