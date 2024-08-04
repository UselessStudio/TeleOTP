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
import {PlausibleAnalyticsContext} from "../../components/PlausibleAnalytics.tsx";

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

/**
 * StorageManager is responsible for saving and restoring accounts from Telegram's CloudStorage.
 * StorageManager encrypts the accounts by calling encrypt/decrypt methods on the EncryptionManager.
 *
 * Telegram CloudStorage is limited to 1024 keys. A few of these keys are used to store the data for the decryption
 * and more could be used later for other features. Each account is stored as the different CloudStorage item,
 * so the limit of the accounts is around 1000. We do not limit the amount of the accounts that user has because
 * this number is somewhat impractical in real-world use.
 *
 * To get an instance of StorageManager, you should use the useContext hook:
 * @example
 * const storageManager = useContext(StorageManagerContext);
 */
export interface StorageManager {
    /**
     * This is a boolean flag indicating if the StorageManager had loaded and decrypted the accounts. If this flag is false, UI should display a loading indicator.
     */
    ready: boolean;
    /**
     * This is an array containing every account currently in the storage.
     * This array is updated every time a new account is saved/removed.
     */
    accounts: Account[];

    /**
     * This method saves the provided account in the CloudStorage. If the account with the same id exists, it is overridden.
     * @param account - account to be saved
     *
     * @note If you need to save multiple accounts, use saveAccounts
     */
    saveAccount(account: Account): void;

    /**
     * This method should be used if needed to save multiple accounts.
     * @param accounts - an array of accounts to be saved
     */
    saveAccounts(accounts: Account[]): void;

    /**
     * This method removes the account with provided id from the CloudStorage.
     * @param id - id of account to remove
     */
    removeAccount(id: string): void;

    /**
     * This method clears the entirety of the CloudStorage.
     * It removes accounts and password salt with KCV.
     * After this method is executed, the removePassword method on EncryptionManager
     * is executed to ensure that the account was deleted.
     */
    clearStorage(): void;

    /**
     * This method returns the max value of the accounts' order.
     */
    lastOrder(): number;

    /**
     * This method moves the provided account to the new position.
     * Other accounts that have to be shifted are also updated here automatically.
     * @param accountId - the id of account to move
     * @param order - new index of the account
     */
    reorder(accountId: string, order: number): void;
}

export const StorageManagerContext = createContext<StorageManager | null>(null);

/**
 * StorageManager is created using StorageManagerProvider component
 *
 * @note StorageManagerProvider must be used inside the EncryptionManagerProvider
 */
export const StorageManagerProvider: FC<PropsWithChildren> = ({ children }) => {
    const encryptionManager = useContext(EncryptionManagerContext);
    const analytics = useContext(PlausibleAnalyticsContext);

    const [ready, setReady] = useState(false);
    const [accounts, setAccountsRaw] = useState<Account[]>([]);
    function setAccounts(accounts: Account[]) {
        setAccountsRaw(accounts.sort((a, b) => a.order - b.order)
            .map((acc, index) => {
                acc.order = index;
                return acc;
            }));
    }

    const [checking, setChecking] = useState<boolean>(false);
    useEffect(() => {
        if(checking) return;
        setChecking(true);
        if(encryptionManager?.isLocked && encryptionManager.storageChecked) {
            setReady(true);
            return;
        } else {
            setReady(false);
        }

        window.Telegram.WebApp.CloudStorage.getKeys((error, keys) => {
            if (error) {
                window.Telegram.WebApp.showAlert(`Failed to get accounts: ${error}`);
                return;
            }
            const accounts = keys?.filter(a => a.startsWith("account")) ?? [];
            window.Telegram.WebApp.CloudStorage.getItems([...accounts, "version"],
                (error, result) => {
                if (error ?? !result) {
                    window.Telegram.WebApp.showAlert(`Failed to get accounts: ${error}`);
                    return;
                }
                const storageVersion: string = keys?.includes("version") ? result.version : "1";
                delete result.version;
                
                let accounts = Object.values(result)
                    .map(value => encryptionManager?.decrypt(value))
                    .filter((x): x is string => !!x)
                    .map(value => JSON.parse(value) as AccountBase);

                console.log(`Storage version: ${storageVersion}, Latest version: ${LATEST_ACCOUNT_VERSION}, Accounts: ${accounts.length}`)
                if (accounts.length > 0 && (!storageVersion || storageVersion !== LATEST_ACCOUNT_VERSION)) {
                    console.log("Version mismatch", accounts);
                    accounts = accounts.map((account, index) => {
                        const migrated = migrate(
                            MIGRATIONS_SCHEMA,
                            account as Account,
                            storageVersion as Version,
                            LATEST_ACCOUNT_VERSION as Version
                        ) as Account;
                        console.log("migrated", migrated);
                        if (migrated.order < 0) migrated.order = index;
                        return migrated;
                    });

                    storageManager.saveAccounts(accounts as Account[]);
                    window.Telegram.WebApp.CloudStorage.setItem(
                        "version",
                        LATEST_ACCOUNT_VERSION
                    );
                }
                
                setAccounts(accounts as Account[]);
                setReady(true);
                setChecking(false);
            });
        });
    }, [encryptionManager?.isLocked]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const storageManager: StorageManager = {
        ready,
        accounts,
        saveAccounts(accounts: Account[]) {
            const newAccounts: Record<string, Account> = {};
            for (const account of this.accounts) {
                newAccounts[account.id] = account;
            }
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

            setAccounts(Object.values(newAccounts));
        },
        saveAccount(account) {
            this.saveAccounts([account]);
        },
        removeAccount(id: string) {
            window.Telegram.WebApp.CloudStorage.removeItem(
                "account" + id,
                (error, result) => {
                    if (error ?? !result) return;
                    setAccounts(accounts.filter(acc => acc.id !== id));
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
                            setAccounts([]);
                            encryptionManager?.removePassword();
                            setReady(true);
                        }
                    }
                );
            });
        },
        lastOrder(): number {
            return Math.max(...accounts.map((acc) => acc.order));
        },
        reorder(accountId: string, destination: number) {
            setAccountsRaw(accounts => {
                const source = accounts.findIndex(acc => acc.id == accountId);
                if(source == -1 || accounts[source].order === destination) return accounts;
                const account = accounts.splice(source, 1)[0];
                accounts.splice(destination, 0, account);
                return accounts.map((acc, index) => {
                    acc.order = index;
                    return acc;
                });
            });
        },

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
        const newAccounts = accounts.filter((account) => !uris.includes(account.uri));
        storageManager.saveAccounts(newAccounts);
        setImported(true);

        if(newAccounts.length > 0) {
            analytics?.trackEvent("Accounts imported from TeleOTP");
        }
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
