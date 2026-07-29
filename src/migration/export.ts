import { URI } from "otpauth";
import type { AccountBase } from "../managers/storage/storage.tsx";
import { Payload } from "./proto/generated/migration.js";

export default function exportGoogleAuthenticator(
    accounts: AccountBase[],
): string {
    const otpParameters: Payload.OtpParameters[] = [];
    for (const account of accounts) {
        let otp: ReturnType<typeof URI.parse> | undefined;
        try {
            otp = URI.parse(account.uri);
        } catch (_e) {
            console.log("weird uri!", otp);
            continue;
        }
        otpParameters.push(
            new Payload.OtpParameters({
                secret: new Uint8Array(otp.secret.buffer),
                name: account.issuer
                    ? `${account.issuer}:${account.label}`
                    : account.label,
                issuer: account.issuer,
                algorithm: {
                    SHA1: Payload.OtpParameters.Algorithm.ALGORITHM_SHA1,
                    SHA256: Payload.OtpParameters.Algorithm.ALGORITHM_SHA256,
                    SHA512: Payload.OtpParameters.Algorithm.ALGORITHM_SHA512,
                    MD5: Payload.OtpParameters.Algorithm.ALGORITHM_MD5,
                }[otp.algorithm],
                digits:
                    otp.digits === 8
                        ? Payload.OtpParameters.DigitCount.DIGIT_COUNT_EIGHT
                        : Payload.OtpParameters.DigitCount.DIGIT_COUNT_SIX,
                type: Payload.OtpParameters.OtpType.OTP_TYPE_TOTP,
            }),
        );
    }

    const payload = new Payload({
        otpParameters,
        version: 1,
        batchSize: 1,
        batchIndex: 0,
        batchId: null,
    });

    const data = Payload.encode(payload).finish();

    return btoa(String.fromCharCode(...data));
}
