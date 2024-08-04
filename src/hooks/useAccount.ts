import {useEffect, useState} from "react";
import {HOTP, TOTP, URI} from "otpauth";

/**
 * This hook generates the actual 2FA code.
 * Progress is updated every 300ms. If accountUri is not provided or invalid, the code returned is "N/A".
 *
 * Generation of codes is implemented in the [otpauth library](https://github.com/hectorm/otpauth).
 * @param {string} accountUri - a string which contains a [key URI](https://github.com/google/google-authenticator/wiki/Key-Uri-Format).
 * @returns - `code` is the generated code string.
 * - `period` is the token time-to-live duration in seconds.
 * - `progress` is the current token lifespan progress. A number between 0 (fresh) and 1 (expired).
 */
export default function useAccount(accountUri?: string): { code: string, period: number, progress: number } {
  const [code, setCode] = useState("N/A");
  const [period, setPeriod] = useState(30);
  useEffect(() => {
    if (!accountUri) return;
    let otp: HOTP | TOTP;
    try {
      otp = URI.parse(accountUri);
    } catch (e) {
      console.error("weird uri!", accountUri);
      setCode("N/A");
      return;
    }
    if (otp instanceof HOTP) {
        throw new Error("HOTP is not supported");
    }

    setPeriod(otp.period);
    let timeout: NodeJS.Timeout | null = null;

    function cycle() {
        setCode(otp.generate());
        const untilNext = period - (Math.floor(Date.now() / 1000) % period);
        timeout = setTimeout(cycle, untilNext * 1000);
    }
    cycle();

    return () => {
        if (timeout) clearTimeout(timeout);
    }
  }, [accountUri, period]);


    const [progress, setProgress] = useState(0);
    useEffect(() => {
        if (!accountUri) return;
        const timer = setInterval(()=>{
            setProgress(((Date.now() / 1000) % period) / period);
        }, 300);

        return () => {
            clearInterval(timer);
        };
    }, [accountUri, period]);
    return {code, period, progress};
}
