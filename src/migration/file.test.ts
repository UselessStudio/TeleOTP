import { Secret, TOTP } from "otpauth";
import { describe, expect, test } from "vitest";
import type { Account } from "../managers/storage/storage.tsx";
import { decodeBackup, encodeBackup } from "./file.ts";

function account(label: string, order: number): Account {
    const otp = new TOTP({
        issuer: "Example",
        label,
        secret: new Secret({
            buffer: new Uint8Array([1, 2, 3, order + 1]).buffer,
        }),
    });
    return {
        id: label,
        uri: otp.toString(),
        label,
        issuer: otp.issuer,
        icon: "example",
        color: "#abcdef",
        order,
    };
}

describe("TeleOTP backup file", () => {
    test("round-trips every account field in saved order", () => {
        const decoded = decodeBackup(
            encodeBackup([account("second", 1), account("first", 0)]),
        );

        expect(decoded?.map(({ id: _id, ...value }) => value)).toEqual(
            [
                { ...account("first", 0), id: undefined },
                { ...account("second", 1), id: undefined },
            ].map(({ id: _id, ...value }) => value),
        );
    });

    test("rejects malformed files", () => {
        expect(decodeBackup(new Uint8Array([1, 2, 3]))).toBeNull();
    });
});
