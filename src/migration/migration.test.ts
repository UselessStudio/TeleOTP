import { Secret, TOTP } from "otpauth";
import { describe, expect, test } from "vitest";
import type { Account } from "../managers/storage/storage.tsx";
import exportGoogleAuthenticator, { toBase64Url } from "./export.ts";
import decodeGoogleAuthenticator from "./import.ts";
import { Payload } from "./proto/generated/migration.js";

function migrationUri(data: string) {
    return `otpauth-migration://offline?data=${toBase64Url(data)}`;
}

describe("Google Authenticator migration", () => {
    test("preserves TeleOTP icon and color extensions", () => {
        const otp = new TOTP({
            issuer: "Example",
            label: "alice@example.com",
            secret: new Secret({
                buffer: new Uint8Array([1, 2, 3, 4]).buffer,
            }),
        });
        const account: Account = {
            id: "account-id",
            uri: otp.toString(),
            label: otp.label,
            issuer: otp.issuer,
            icon: "example",
            color: "#abcdef",
            order: 0,
        };

        const imported = decodeGoogleAuthenticator(
            migrationUri(exportGoogleAuthenticator([account])),
        );

        expect(imported).toHaveLength(1);
        expect(imported?.[0]).toMatchObject({
            icon: "example",
            color: "#abcdef",
        });
    });

    test("uses defaults for standard Google payloads without extensions", () => {
        const payload = new Payload({
            otpParameters: [
                new Payload.OtpParameters({
                    secret: new Uint8Array([1, 2, 3, 4]),
                    name: "Example:alice@example.com",
                    issuer: "Example",
                    algorithm: Payload.OtpParameters.Algorithm.ALGORITHM_SHA1,
                    digits: Payload.OtpParameters.DigitCount.DIGIT_COUNT_SIX,
                    type: Payload.OtpParameters.OtpType.OTP_TYPE_TOTP,
                }),
            ],
            version: 1,
            batchSize: 1,
            batchIndex: 0,
        });
        const data = btoa(
            String.fromCharCode(...Payload.encode(payload).finish()),
        );

        const imported = decodeGoogleAuthenticator(migrationUri(data));

        expect(imported?.[0]).toMatchObject({
            icon: "key",
            color: "#1976d2",
            order: 0,
        });
    });

    test("exports accounts by their saved order", () => {
        const createAccount = (label: string, order: number): Account => {
            const otp = new TOTP({
                label,
                secret: new Secret({
                    buffer: new Uint8Array([1, 2, 3, order + 1]).buffer,
                }),
            });
            return {
                id: label,
                uri: otp.toString(),
                label,
                icon: "key",
                color: "#1976d2",
                order,
            };
        };

        const imported = decodeGoogleAuthenticator(
            migrationUri(
                exportGoogleAuthenticator([
                    createAccount("third", 2),
                    createAccount("first", 0),
                    createAccount("second", 1),
                ]),
            ),
        );

        expect(imported?.map(({ label, order }) => ({ label, order }))).toEqual(
            [
                { label: "first", order: 0 },
                { label: "second", order: 1 },
                { label: "third", order: 2 },
            ],
        );
    });
});
