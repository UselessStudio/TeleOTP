import { HOTP, type TOTP, URI } from "otpauth";
import { useEffect, useState } from "react";

/**
 * This hook generates the actual 2FA code.
 * Progress is updated every 300ms. If accountUri is not provided or invalid, the code returned is "N/A".
 *
 * Generation of codes is implemented in the [otpauth library](https://github.com/hectorm/otpauth).
 * @param {string} accountUri - a string which contains a [key URI](https://github.com/google/google-authenticator/wiki/Key-Uri-Format).
 * @returns - `code` is the generated code string.
 * - `previousCode` and `nextCode` are generated for the adjacent time windows.
 * - `period` is the token time-to-live duration in seconds.
 * - `progress` is the current token lifespan progress. A number between 0 (fresh) and 1 (expired).
 */
export default function useAccount(accountUri?: string): {
    code: string;
    previousCode: string;
    nextCode: string;
    period: number;
    progress: number;
} {
    const [code, setCode] = useState("N/A");
    const [previousCode, setPreviousCode] = useState("N/A");
    const [nextCode, setNextCode] = useState("N/A");
    const [period, setPeriod] = useState(30);
    useEffect(() => {
        if (!accountUri) return;
        let otp: HOTP | TOTP;
        try {
            otp = URI.parse(accountUri);
        } catch (_e) {
            console.error("weird uri!", accountUri);
            setCode("N/A");
            setPreviousCode("N/A");
            setNextCode("N/A");
            return;
        }
        if (otp instanceof HOTP) {
            throw new Error("HOTP is not supported");
        }
        const totp = otp;

        setPeriod(totp.period);
        let timeout: ReturnType<typeof setTimeout> | null = null;

        function cycle() {
            const timestamp = Date.now();
            const periodMilliseconds = totp.period * 1000;
            setPreviousCode(
                totp.generate({ timestamp: timestamp - periodMilliseconds }),
            );
            setCode(totp.generate({ timestamp }));
            setNextCode(
                totp.generate({ timestamp: timestamp + periodMilliseconds }),
            );
            const untilNext =
                totp.period - (Math.floor(timestamp / 1000) % totp.period);
            timeout = setTimeout(cycle, untilNext * 1000);
        }
        cycle();

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [accountUri]);

    const [progress, setProgress] = useState(0);
    useEffect(() => {
        if (!accountUri) return;
        const timer = setInterval(() => {
            setProgress(((Date.now() / 1000) % period) / period);
        }, 300);

        return () => {
            clearInterval(timer);
        };
    }, [accountUri, period]);
    return { code, previousCode, nextCode, period, progress };
}
