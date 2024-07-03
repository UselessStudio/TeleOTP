import {
    createContext,
    FC,
    PropsWithChildren,
    useContext,
    useEffect,
    useState,
} from "react";
import { EncryptionManagerContext } from "../encryption.tsx";
import { Color, Icon } from "../../globals.tsx";
import decodeGoogleAuthenticator from "../../migration/import.ts";
import { migrate, Version } from "./migrate.ts";
import { MIGRATIONS_SCHEMA } from "./migrations.ts";

export interface AccountBase {
    id: string;
    uri: string;
    label: string;
    issuer?: string;
}

export interface AccountV1 extends AccountBase {
    color: Color;
    icon: Icon;
}
// prettier-ignore
export interface AccountV2 extends Pick<AccountV1, "id" | "label" | "issuer" | "uri"> {
    order: number;
    color: string;
    icon: string;
}

//! make sure to update this when creating new migration
//! must always point to last version account
export type Account = AccountV2;
const LATEST_ACCOUNT_VERSION = "2";

export interface AccountVersions {
    "1": AccountV1;
    "2": AccountV2;
}

export interface StorageManager {
    ready: boolean;
    accounts: Record<string, Account>;
    saveAccount(account: Account): void;
    saveAccounts(accounts: Account[]): void;
    removeAccount(id: string): void;
    clearStorage(): void;
    lastOrder(): number;
    reorder(): void;
}

export const StorageManagerContext = createContext<StorageManager | null>(null);

export const StorageManagerProvider: FC<PropsWithChildren> = ({ children }) => {
    const encryptionManager = useContext(EncryptionManagerContext);

    const [ready, setReady] = useState(false);
    const [accounts, setAccounts] = useState<Record<string, Account>>({});
    useEffect(() => {
        if (!encryptionManager)
            throw new Error("Could not reach EncryptionManager");

        if (encryptionManager.isLocked && encryptionManager.storageChecked) {
            setReady(true);
            return;
        } else {
            setReady(false);
        }

        window.Telegram.WebApp.CloudStorage.getKeys((error, result) => {
            if (error) {
                window.Telegram.WebApp.showAlert(
                    `Failed to get accounts: ${error}`
                );
                return;
            }
            let storageVersion = result?.find((a) => a === "version");
            const accounts =
                result?.filter((a) => a.startsWith("account")) ?? [];
            window.Telegram.WebApp.CloudStorage.getItems(
                accounts,
                (error, result) => {
                    if (error ?? !result) {
                        window.Telegram.WebApp.showAlert(
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            `Failed to get accounts: ${error}`
                        );
                        return;
                    }

                    const accounts = Object.values(result)
                        .map((value) => encryptionManager.decrypt(value))
                        .filter((x): x is string => !!x)
                        .map((value) => JSON.parse(value) as AccountBase)
                        .reduce((acc: Record<string, AccountBase>, curr) => {
                            acc[curr.id] = curr;
                            return acc;
                        }, {});

                    if (!storageVersion || storageVersion !== LATEST_ACCOUNT_VERSION) {
                        storageVersion ??= "1";
                        Object.keys(accounts).map((accountId, index) => {
                            const account = accounts[accountId];
                            const migrated = migrate(
                                MIGRATIONS_SCHEMA,
                                account as Account,
                                storageVersion as Version,
                                LATEST_ACCOUNT_VERSION as Version
                            ) as Account;
                            if (migrated.order < 0) migrated.order = index;
                            accounts[accountId] = migrated;
                            window.Telegram.WebApp.CloudStorage.setItem(
                                'account' + accountId,
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                encryptionManager.encrypt(
                                    JSON.stringify(migrated)
                                )!
                            );
                        });
                        window.Telegram.WebApp.CloudStorage.setItem(
                            "version",
                            LATEST_ACCOUNT_VERSION
                        );
                    }

                    setAccounts(accounts as Record<string, Account>);
                    setReady(true);
                }
            );
        });
    }, [encryptionManager?.isLocked]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const storageManager: StorageManager = {
        ready,
        accounts,
        saveAccounts(accounts: Account[]) {
            const newAccounts: Record<string, Account> = {};
            for (const account of accounts) {
                const encrypted = encryptionManager?.encrypt(
                    JSON.stringify(account)
                );
                if (!encrypted) continue;
                window.Telegram.WebApp.CloudStorage.setItem(
                    "account" + account.id,
                    encrypted
                );
                newAccounts[account.id] = account;
            }

            setAccounts({ ...this.accounts, ...newAccounts });
        },
        saveAccount(account) {
            this.saveAccounts([account]);
        },
        removeAccount(id: string) {
            window.Telegram.WebApp.CloudStorage.removeItem(
                "account" + id,
                (error, result) => {
                    if (error ?? !result) return;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [id]: _, ...newAccounts } = accounts;
                    setAccounts(newAccounts);
                }
            );
        },
        clearStorage(): void {
            setReady(false);
            window.Telegram.WebApp.CloudStorage.getKeys((error, result) => {
                if (error ?? !result) return;
                window.Telegram.WebApp.CloudStorage.removeItems(
                    result,
                    (error, result) => {
                        if (!error && result) {
                            setAccounts({});
                            encryptionManager?.removePassword();
                            setReady(true);
                        }
                    }
                );
            });
        },
        lastOrder(): number {
            return Math.max(...Object.values(accounts).map((acc) => acc.order));
        },
        reorder(): void {
            // TODO reorder accounts to be like [1,4,7] => [1,2,3]
            throw new Error("Not implemented");
        }
    };

    const [keyChanged, setKeyChanged] = useState(false);

    useEffect(() => {
        if (!encryptionManager?.oldKey) return;
        setKeyChanged(true);
    }, [encryptionManager?.oldKey]);

    useEffect(() => {
        if (!keyChanged) return;
        setKeyChanged(false);

        Object.values(accounts).forEach((account) => {
            const encrypted = encryptionManager?.encrypt(
                JSON.stringify(account)
            );
            if (!encrypted) return;
            window.Telegram.WebApp.CloudStorage.setItem(
                "account" + account.id,
                encrypted
            );
        });
    }, [accounts, encryptionManager, keyChanged]);

    const [imported, setImported] = useState(false);
    useEffect(() => {
        if (!ready || imported) return;

        const param = window.Telegram.WebApp.initDataUnsafe.start_param;
        if (!param) return;

        const url = new URL("otpauth-migration://offline");
        url.searchParams.set("data", param);
        const accounts = decodeGoogleAuthenticator(url.toString());
        if (!accounts) return;

        const uris = Object.values(storageManager.accounts).map((a) => a.uri);

        storageManager.saveAccounts(
            accounts.filter((account) => !uris.includes(account.uri))
        );
        setImported(true);
    }, [ready, imported, storageManager]);

    import.meta.env.DEV &&
        Object.keys(storageManager.accounts).length > 0 &&
        console.log("Accounts", storageManager.accounts);

    return (
        <StorageManagerContext.Provider value={storageManager}>
            {children}
        </StorageManagerContext.Provider>
    );
};
