import { AccountVersions } from "./storage";

export enum MigrationDirection {
    up,
    same,
    down,
}

export type Version = "1" | "2";

export interface AccountStorage<T extends Version> {
    version: T;
    account: AccountVersions[T];
}

export interface Migration<From extends Version, To extends Version> {
    from: From;
    to: To;
    up: MigrateUpFunc<From, To>;
}

export type MigrateUpFunc<From extends Version, To extends Version> = (
    schema: AccountVersions[From]
) => AccountVersions[To];

export type Migrations = [
    Migration<"1", "2">
];

export function migrationDirection(
    fromVersion: string,
    toVersion: string
): MigrationDirection {
    const fromNumber = Number(fromVersion);
    const toNumber = Number(toVersion);
    if (fromNumber < toNumber) return MigrationDirection.up;
    else if (fromNumber > toNumber) return MigrationDirection.down;
    else return MigrationDirection.same;
}

export function migrate<From extends Version, To extends Version>(
    migrations: Migrations,
    account: AccountVersions[From],
    fromVersion: From,
    toVersion: To
): AccountVersions[To] {
    const direction = migrationDirection(fromVersion, toVersion);
    if (direction === MigrationDirection.same) {
        return account as AccountVersions[To];
    }

    let migratedAccount: object = {};
    let accVer: Version = fromVersion;
    while (accVer !== toVersion) {
        const currentMigration = migrations.find(
            (migration) => migration.from === accVer
        );
        if (!currentMigration) {
            // if there is no migration means nothing changed
            throw new Error(
                `Could not find migration path from ${accVer} to ${toVersion}`
            );
        }
        migratedAccount = currentMigration.up(account);
        accVer = currentMigration.to;
    }

    return migratedAccount as AccountVersions[To];
}
