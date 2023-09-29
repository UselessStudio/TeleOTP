import {Stack, Typography} from "@mui/material";
import {useRef, useState} from "react";
import Lottie, {LottieRefCurrentProps} from "lottie-react";
import ManualAnimation from "../assets/manual_lottie.json";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import {useNavigate} from "react-router-dom";
import {NewAccountState} from "./CreateAccount.tsx";
import {TOTP} from "otpauth";
import TelegramTextField from "../components/TelegramTextField.tsx";

export default function ManualAccount() {
    const lottie = useRef<LottieRefCurrentProps | null>(null);
    const [secret, setSecret] = useState("");
    const [invalid, setInvalid] = useState(false);
    const navigate = useNavigate();
    useTelegramMainButton(() => {
        if(secret.length < 1) {
            setInvalid(true);
            return false;
        }
        try {
            navigate("/create", {state: {
                    otp: new TOTP({
                        label: "TeleOTP",
                        secret
                    }),
                } as NewAccountState});
            return true;
        } catch (e) {
            setInvalid(true);
            return false;
        }

    }, "Next");

    return <Stack spacing={2} alignItems="center">
        <Lottie
            onClick={() => lottie.current?.goToAndPlay(0)}
            lottieRef={lottie} style={{width: '50%'}}
            animationData={ManualAnimation}
            loop={false}
        />
        <Typography variant="h5" fontWeight="bold" align="center">
            Add account manually
        </Typography>
        <Typography variant="subtitle2" align="center">
            Enter provided account secret
        </Typography>
        <TelegramTextField
            fullWidth
            label="Secret"
            value={secret}
            error={invalid}
            helperText={invalid ? "Invalid secret" : null}
            onChange={e => {
                setSecret(e.target.value);
                setInvalid(false);
            }}
        />
    </Stack>;
}