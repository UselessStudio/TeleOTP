import { URI } from "otpauth";
import type { Account } from "../managers/storage/storage.tsx";
import { Payload } from "./proto/generated/migration.js";

interface ExportOptions {
    batchSize?: number;
    batchIndex?: number;
    batchId?: number;
}

export default function exportGoogleAuthenticator(
    accounts: Account[],
    options: ExportOptions = {},
): string {
    const otpParameters: Payload.OtpParameters[] = [];
    const sortedAccounts = [...accounts].sort((a, b) => a.order - b.order);
    for (const account of sortedAccounts) {
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
                icon: account.icon,
                color: account.color,
            }),
        );
    }

    const payload = new Payload({
        otpParameters,
        version: 1,
        batchSize: options.batchSize ?? 1,
        batchIndex: options.batchIndex ?? 0,
        batchId: options.batchId ?? null,
    });

    const data = Payload.encode(payload).finish();

    return btoa(String.fromCharCode(...data));
}

export function toBase64Url(data: string): string {
    return data.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function exportGoogleAuthenticatorBatches(
    accounts: Account[],
    maxLength: number,
    serialize: (data: string) => string = toBase64Url,
): string[] {
    if (accounts.length === 0) return [];

    const batchId = crypto.getRandomValues(new Uint32Array(1))[0] & 0x7fffffff;
    const accountBatches: Account[][] = [];
    let currentBatch: Account[] = [];
    const sortedAccounts = [...accounts].sort((a, b) => a.order - b.order);

    for (const account of sortedAccounts) {
        const candidate = [...currentBatch, account];
        const candidateData = exportGoogleAuthenticator(candidate, {
            batchSize: accounts.length,
            batchIndex: accounts.length - 1,
            batchId,
        });

        if (
            currentBatch.length > 0 &&
            serialize(candidateData).length > maxLength
        ) {
            accountBatches.push(currentBatch);
            currentBatch = [account];
        } else {
            currentBatch = candidate;
        }
    }
    accountBatches.push(currentBatch);

    return accountBatches.map((batch, batchIndex) =>
        serialize(
            exportGoogleAuthenticator(batch, {
                batchSize: accountBatches.length,
                batchIndex,
                batchId,
            }),
        ),
    );
}
