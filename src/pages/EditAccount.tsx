import {useLocation, useNavigate} from "react-router-dom";
import {Ref, createRef, useContext, useState} from "react";
import {Account, StorageManagerContext} from "../managers/storage/storage.tsx";
import {Icon} from "../globals.tsx";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import {Button, Stack, Typography} from "@mui/material";
import LottieAnimation from "../components/LottieAnimation.tsx";
import CreateAnimation from "../assets/create_lottie.json";
import TelegramTextField from "../components/TelegramTextField.tsx";
import IconPicker from "../components/IconPicker.tsx";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import useTelegramHaptics from "../hooks/telegram/useTelegramHaptics.ts";

export interface EditAccountState {
    account: Account;
}

export default function EditAccount() {
    const navigate = useNavigate();
    const location = useLocation();
    const { notificationOccurred } = useTelegramHaptics();
    const state = location.state as EditAccountState;
    const storageManager = useContext(StorageManagerContext);

    const [issuer, setIssuer] = useState(state.account.issuer);
    const [label, setLabel] = useState(state.account.label);
    const [selectedIcon, setSelectedIcon] = useState<Icon>(state.account.icon);
    const [selectedColor, setSelectedColor] = useState<string>(state.account.color);
    const labelInput: Ref<HTMLInputElement> = createRef();

    useTelegramMainButton(() => {
        if (!label || !labelInput.current?.checkValidity()) {
            window.Telegram.WebApp.showAlert("Label field cannot be empty!");
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
    }, "Save");

    return <Stack spacing={2} alignItems="center">
        <LottieAnimation animationData={CreateAnimation}/>
        <Typography variant="h5" fontWeight="bold" align="center">
            Edit account info
        </Typography>
        <Typography variant="subtitle2" align="center">
            Modify account information
        </Typography>
        <TelegramTextField
            required
            inputRef={labelInput}
            fullWidth
            label="Label"
            value={label}
            onChange={e => {
                setLabel(e.target.value);
            }}
        />
        <TelegramTextField
            fullWidth
            label="Service"
            value={issuer}
            onChange={e => {
                setIssuer(e.target.value);
            }}
        />
        <IconPicker
            setSelectedIcon={setSelectedIcon}
            selectedIcon={selectedIcon}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}/>

        <Button startIcon={<DeleteOutlinedIcon/>} color="error" onClick={() => {
            notificationOccurred("warning");
            window.Telegram.WebApp.showPopup({
                message: `Are you sure you want to delete ${state.account.issuer ? 
                    `${state.account.issuer} (${state.account.label})` : 
                    state.account.label}?`,
                buttons: [
                    {type: "destructive", text: "Yes", id: "remove"},
                    {type: "cancel", id: "cancel"},
                ]
            }, (id) => {
                if (id !== "remove") return;
                storageManager?.removeAccount(state.account.id);
                navigate("/");
            });
        }}>
            Delete account
        </Button>
    </Stack>;
}
