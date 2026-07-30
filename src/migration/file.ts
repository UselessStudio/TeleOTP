import { nanoid } from "nanoid";
import { URI } from "otpauth";
import type { Account } from "../managers/storage/storage.tsx";
import { Backup } from "./proto/generated/migration.js";

const BACKUP_VERSION = 1;

export function encodeBackup(accounts: Account[]): Uint8Array {
    const backup = new Backup({
        version: BACKUP_VERSION,
        accounts: [...accounts]
            .sort((a, b) => a.order - b.order)
            .map(
                (account, order) =>
                    new Backup.Account({
                        uri: account.uri,
                        label: account.label,
                        issuer: account.issuer,
                        icon: account.icon,
                        color: account.color,
                        order,
                    }),
            ),
    });

    return Backup.encode(backup).finish();
}

export function decodeBackup(data: Uint8Array): Account[] | null {
    try {
        const backup = Backup.decode(data);
        if (backup.version !== BACKUP_VERSION || backup.accounts.length === 0)
            return null;

        return [...backup.accounts]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((account, order) => {
                if (!account.uri || !account.label)
                    throw new Error("Invalid account");
                URI.parse(account.uri);

                return {
                    id: nanoid(),
                    uri: account.uri,
                    label: account.label,
                    issuer: account.issuer ?? undefined,
                    icon: account.icon || "key",
                    color: account.color || "#1976d2",
                    order,
                };
            });
    } catch (_error) {
        return null;
    }
}
