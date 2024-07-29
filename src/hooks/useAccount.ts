import {useEffect, useState} from "react";
import {HOTP, TOTP, URI} from "otpauth";

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
