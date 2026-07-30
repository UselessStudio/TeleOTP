import { nanoid } from "nanoid";
import { Secret, TOTP } from "otpauth";
import type { Account } from "../managers/storage/storage.tsx";
import { Payload } from "./proto/generated/migration.js";

export default function decodeGoogleAuthenticator(
    uri: string,
): Account[] | null {
    if (!uri.startsWith("otpauth-migration://offline")) return null;

    const url = new URL(uri);
    let dataParam = url.searchParams.get("data");
    if (!dataParam) return null;

    // Convert from base64url
    dataParam = dataParam.replace(/-/g, "+").replace(/_/g, "/");

    if (dataParam.length % 4 !== 0) {
        const pad = 4 - (dataParam.length % 4);
        dataParam += "=".repeat(pad);
    }

    const buffer = Uint8Array.from(atob(dataParam), (c) => c.charCodeAt(0));

    let payload: ReturnType<typeof Payload.decode>;
    try {
        payload = Payload.decode(buffer);
    } catch (_e) {
        return null;
    }

    const accounts: Account[] = [];

    for (const [order, otp] of payload.otpParameters.entries()) {
        if (otp.type !== Payload.OtpParameters.OtpType.OTP_TYPE_TOTP) continue;
        if (!otp.secret || !otp.name) continue;

        const totp = new TOTP({
            issuer: otp.issuer ?? undefined,
            label: otp.name ? otp.name.split(":").pop() : undefined,
            secret: new Secret({ buffer: otp.secret.buffer }),
            digits:
                otp.digits ===
                Payload.OtpParameters.DigitCount.DIGIT_COUNT_EIGHT
                    ? 8
                    : 6,
            algorithm: otp.algorithm
                ? {
                      [Payload.OtpParameters.Algorithm.ALGORITHM_SHA1]: "SHA1",
                      [Payload.OtpParameters.Algorithm.ALGORITHM_SHA256]:
                          "SHA256",
                      [Payload.OtpParameters.Algorithm.ALGORITHM_SHA512]:
                          "SHA512",
                      [Payload.OtpParameters.Algorithm.ALGORITHM_MD5]: "MD5",
                      [Payload.OtpParameters.Algorithm.ALGORITHM_UNSPECIFIED]:
                          undefined,
                  }[otp.algorithm]
                : undefined,
        });
        accounts.push({
            id: nanoid(),
            label: totp.label,
            issuer: otp.issuer ?? undefined,
            color: otp.color ?? "#1976d2", // primary
            icon: otp.icon ?? "key",
            uri: totp.toString(),
            order,
        });
    }

    return accounts;
}
