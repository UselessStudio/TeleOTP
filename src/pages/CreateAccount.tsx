import {Stack, Typography} from "@mui/material";
import {useRef, useState} from "react";
import Lottie, {LottieRefCurrentProps} from "lottie-react";
import CreateAnimation from "../assets/create_lottie.json";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import {TOTP} from "otpauth";
import {useLocation} from "react-router-dom";
import IconPicker from "../components/IconPicker.tsx";
import TelegramTextField from "../components/TelegramTextField.tsx";

export interface NewAccountState {
    otp: TOTP,
}

export function CreateAccount() {
    const lottie = useRef<LottieRefCurrentProps | null>(null);
    const location = useLocation();
    const state = location.state as NewAccountState;

    const [issuer, setIssuer] = useState(state.otp.issuer);
    const [label, setLabel] = useState(state.otp.label);

    useTelegramMainButton(() => {
        console.log(state.otp.toString());
        return false;
    }, "Create");

    return <Stack spacing={2} alignItems="center">
        <Lottie
            onClick={() => lottie.current?.goToAndPlay(0)}
            lottieRef={lottie} style={{width: '50%'}}
            animationData={CreateAnimation}
            loop={false}
        />
        <Typography variant="h5" fontWeight="bold" align="center">
            Add new account
        </Typography>
        <Typography variant="subtitle2" align="center">
            Enter additional account information
        </Typography>
        <TelegramTextField
            fullWidth
            label="Label (required)"
            value={label}
            onChange={e => {
                state.otp.label = e.target.value;
                setLabel(e.target.value);
            }}
        />
        <TelegramTextField
            fullWidth
            label="Service"
            value={issuer}
            onChange={e => {
                state.otp.issuer = e.target.value;
                setIssuer(e.target.value);
            }}
        />
        <IconPicker/>
    </Stack>;
}