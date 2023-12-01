import {createContext, FC, PropsWithChildren, useContext, useEffect, useState} from "react";
import {EncryptionManagerContext} from "./encryption.tsx";
import {Color, Icon} from "../globals.tsx";
import decodeGoogleAuthenticator from "../migration/import.ts";

export interface Account {
    id: string;
    label: string;
    issuer?: string;
    uri: string;
    color: Color;
    icon: Icon;
}

export interface StorageManager {
    ready: boolean;
    accounts: Record<string, Account>;
    saveAccount(account: Account): void;
    saveAccounts(accounts: Account[]): void;
    removeAccount(id: string): void;
    clearStorage(): void;
}

export const StorageManagerContext = createContext<StorageManager | null>(null);

export const StorageManagerProvider: FC<PropsWithChildren> = ({children}) => {
    const encryptionManager = useContext(EncryptionManagerContext);

    const [ready, setReady] = useState(false);
    const [accounts, setAccounts] = useState<Record<string, Account>>({});
    useEffect(() => {
        if(encryptionManager?.isLocked && encryptionManager.storageChecked) {
            setReady(true);
            return;
        } else {
            setReady(false);
        }

        window.Telegram.WebApp.CloudStorage.getKeys((error, result) => {
            if (error) {
                window.Telegram.WebApp.showAlert(`Failed to get accounts: ${error}`);
                return;
            }
            const accounts = result?.filter(a => a.startsWith("account")) ?? [];
            window.Telegram.WebApp.CloudStorage.getItems(accounts, (error, result) => {
                if (error ?? !result) {
                    window.Telegram.WebApp.showAlert(`Failed to get accounts: ${error}`);
                    return;
                }

                const accounts = Object.values(result)
                    .map(value => encryptionManager?.decrypt(value))
                    .filter((x): x is string => !!x)
                    .map(value => JSON.parse(value) as Account)
                    .reduce((acc: Record<string, Account>, curr) => {
                        acc[curr.id] = curr;
                        return acc;
                    }, {});

                setAccounts(accounts);
                setReady(true);
            });
        });
    }, [encryptionManager?.isLocked]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const storageManager: StorageManager = {
        ready,
        accounts,
        saveAccounts(accounts: Account[]) {
            const newAccounts: Record<string, Account> = {};
            for (const account of accounts) {
                const encrypted = encryptionManager?.encrypt(JSON.stringify(account));
                if (!encrypted) continue;
                window.Telegram.WebApp.CloudStorage.setItem("account"+account.id, encrypted);
                newAccounts[account.id] = account;
            }

            setAccounts({...this.accounts, ...newAccounts});
        },
        saveAccount(account) {
            this.saveAccounts([account]);
        },
        removeAccount(id: string) {
            window.Telegram.WebApp.CloudStorage.removeItem("account"+id, (error, result) => {
                if (error ?? !result) return;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const {[id]: _, ...newAccounts} = accounts;
                setAccounts(newAccounts);
            });
        },
        clearStorage(): void {
            setReady(false);
            window.Telegram.WebApp.CloudStorage.getKeys((error, result) => {
                if (error ?? !result) return;
                window.Telegram.WebApp.CloudStorage.removeItems(result, (error, result) => {
                    if (!error && result) {
                        setAccounts({});
                        encryptionManager?.removePassword();
                        setReady(true);
                    }
                });
            });
        },
    };

    const [keyChanged, setKeyChanged] = useState(false);

    useEffect(() => {
        if(!encryptionManager?.oldKey) return;
        setKeyChanged(true);
    }, [encryptionManager?.oldKey]);

    useEffect(() => {
        if(!keyChanged) return;
        setKeyChanged(false);
        
        Object.values(accounts).forEach(account => {
            const encrypted = encryptionManager?.encrypt(JSON.stringify(account));
            if (!encrypted) return;
            window.Telegram.WebApp.CloudStorage.setItem("account"+account.id, encrypted);
        });
    }, [accounts, encryptionManager, keyChanged]);

    const [imported, setImported] = useState(false);
    useEffect(() => {
        if(!ready || imported) return;

        const param = window.Telegram.WebApp.initDataUnsafe.start_param;
        if(!param) return;

        const url = new URL("otpauth-migration://offline");
        url.searchParams.set("data", param)
        const accounts = decodeGoogleAuthenticator(url.toString());
        if(!accounts) return;

        const uris = Object.values(storageManager.accounts).map(a => a.uri);

        storageManager.saveAccounts(accounts.filter(account => !uris.includes(account.uri)));
        setImported(true);
    }, [ready, imported, storageManager]);

    return <StorageManagerContext.Provider value={storageManager}>
        {children}
    </StorageManagerContext.Provider>
};