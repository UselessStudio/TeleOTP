import { Stack, Typography } from "@mui/material";
import { Secret, TOTP } from "otpauth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ManualAnimation from "../assets/manual_lottie.json";
import LottieAnimation from "../components/LottieAnimation.tsx";
import TelegramTextField from "../components/TelegramTextField.tsx";
import useTelegramMainButton from "../hooks/telegram/useTelegramMainButton.ts";
import { useL10n } from "../hooks/useL10n.ts";
import type { NewAccountState } from "./CreateAccount.tsx";

export default function ManualAccount() {
    const [secret, setSecret] = useState("");
    const [invalid, setInvalid] = useState(false);
    const navigate = useNavigate();
    const l10n = useL10n();

    function createAccount() {
        if (
            !/^[2-7A-Z]+=*$/i.test(secret) ||
            Secret.fromBase32(secret).buffer.byteLength < 1
        ) {
            setInvalid(true);
            return false;
        }
        try {
            navigate("/create", {
                state: {
                    otp: new TOTP({
                        label: "TeleOTP",
                        secret,
                    }),
                } as NewAccountState,
            });
            return true;
        } catch (_e) {
            setInvalid(true);
            return false;
        }
    }

    useTelegramMainButton(createAccount, l10n("NextStepAction"));

    return (
        <Stack spacing={2} alignItems="center">
            <LottieAnimation animationData={ManualAnimation} />
            <Typography variant="h5" fontWeight="bold" align="center">
                {l10n("AddManualTitle")}
            </Typography>
            <Typography variant="subtitle2" align="center">
                {l10n("AddManualDescription")}
            </Typography>
            <TelegramTextField
                autoFocus
                fullWidth
                label={l10n("SecretLabel")}
                value={secret}
                error={invalid}
                helperText={invalid ? l10n("InvalidSecretError") : null}
                onChange={(e) => {
                    setSecret(e.target.value);
                    setInvalid(false);
                }}
                onSubmit={createAccount}
            />
        </Stack>
    );
}
