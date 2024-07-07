import {createContext, FC, PropsWithChildren, useContext, useEffect, useState} from "react";
import * as crypto from "crypto-js";
import {SettingsManagerContext} from "./settings.tsx";
import {BiometricsManagerContext} from "./biometrics.tsx";

const kdfOptions = {keySize: 256 / 8};
const saltBytes = 128 / 8;
const ivBytes = 128 / 8;
const keyCheckValuePlaintext = "key-check-value";

export interface EncryptionManager {
    storageChecked: boolean;
    passwordCreated: boolean | null;
    createPassword(password: string): void;
    removePassword(): void;
    saveBiometricToken(): void;
    removeBiometricToken(): void;

    isLocked: boolean;
    unlock(password: string): boolean;
    unlockBiometrics(): void;
    lock(): void;

    oldKey: crypto.lib.WordArray | null;
    encrypt(data: string): string | null;
    decrypt(data: string): string | null;
}

export interface EncryptedData {
    iv: string,
    cipher: string,
}

export const EncryptionManagerContext = createContext<EncryptionManager | null>(null);

function checkKey(key: crypto.lib.WordArray, salt: crypto.lib.WordArray, keyCheckValue: string): boolean {
    const kcv = crypto.AES.encrypt(keyCheckValuePlaintext, key, {iv: salt}).toString(crypto.format.OpenSSL);
    return kcv === keyCheckValue;
}

function getStoredKey(): crypto.lib.WordArray | null {
    const key = localStorage.getItem("key");
    return key !== null ? crypto.enc.Base64.parse(key) : null;
}

export const EncryptionManagerProvider: FC<PropsWithChildren> = ({ children }) => {
    const [key, setKey] = useState<crypto.lib.WordArray | null>(getStoredKey);
    const [storageChecked, setStorageChecked] = useState(false);
    const [salt, setSalt] = useState<crypto.lib.WordArray | null>(null);
    const [keyCheckValue, setKeyCheckValue] = useState<string | null>(null);
    const [oldKey, setOldKey] = useState<crypto.lib.WordArray | null>(null);

    const biometricsManager = useContext(BiometricsManagerContext);

    const settingsManager = useContext(SettingsManagerContext);

    useEffect(() => {
        if(settingsManager?.shouldKeepUnlocked) {
            if(key !== null) {
                localStorage.setItem("key", crypto.enc.Base64.stringify(key));
            }
        } else {
            localStorage.removeItem("key");
        }
    }, [key, settingsManager?.shouldKeepUnlocked]);

    useEffect(() => {
        window.Telegram.WebApp.CloudStorage.getItems(["salt", "kcv"], (error, result) => {
            if (error) {
                window.Telegram.WebApp.showAlert(`Failed to get salt: ${error}`);
                return;
            }
            const salt = result?.salt ? crypto.enc.Base64.parse(result.salt) : null;
            const kcv = result?.kcv ?? null;
            setSalt(salt);
            setKeyCheckValue(kcv);
            const key = getStoredKey();
            if (salt === null || kcv === null || key === null || !checkKey(key, salt, kcv)) {
                setKey(null);
            }
            setStorageChecked(true);
        });
    }, []);

    const encryptionManager: EncryptionManager = {
        oldKey,
        storageChecked,
        passwordCreated: storageChecked ? salt !== null : null,
        createPassword(password: string) {
            setOldKey(key);
            const salt = crypto.lib.WordArray.random(saltBytes);
            const newKey = crypto.PBKDF2(password, salt, kdfOptions);
            const kcv = crypto.AES.encrypt(keyCheckValuePlaintext, newKey, {iv: salt}).toString(crypto.format.OpenSSL);

            setSalt(salt);
            window.Telegram.WebApp.CloudStorage.setItem("salt", crypto.enc.Base64.stringify(salt));

            setKeyCheckValue(kcv);
            window.Telegram.WebApp.CloudStorage.setItem("kcv", kcv);

            setKey(newKey);
        },
        removePassword() {
            window.Telegram.WebApp.CloudStorage.removeItems(["kcv", "salt"]);
            localStorage.removeItem("key");
            setKey(null);
            setSalt(null);
            setKeyCheckValue(null);
        },
        saveBiometricToken() {
            if (key === null) return;
            biometricsManager?.updateToken(crypto.enc.Base64.stringify(key));
        },
        removeBiometricToken() {
            biometricsManager?.updateToken("");
        },

        isLocked: !storageChecked || key === null,
        unlock(enteredPassword) {
            if (salt === null || keyCheckValue === null) {
                return false;
            }
            const key = crypto.PBKDF2(enteredPassword, salt, kdfOptions);

            if(checkKey(key, salt, keyCheckValue)) {
                setKey(key);
                return true;
            }

            return false;
        },
        lock() {
            setKey(null);
            localStorage.removeItem("key");
        },
        unlockBiometrics() {
            if (salt === null || keyCheckValue === null) {
                return;
            }

            biometricsManager?.getToken((token?) => {
                if (token) {
                    const key = crypto.enc.Base64.parse(token);
                    if(checkKey(key, salt, keyCheckValue)) {
                        setKey(key);
                    }
                }
            });

        },

        encrypt(data) {
            if(key === null) return null;

            const iv = crypto.lib.WordArray.random(ivBytes);
            return JSON.stringify({
                iv: crypto.enc.Base64.stringify(iv),
                cipher: crypto.AES.encrypt(crypto.enc.Utf8.parse(data), key, {iv}).toString()
            } as EncryptedData);
        },
        decrypt(data) {
            if(key === null) return null;
            try {
                const {iv, cipher}: EncryptedData = JSON.parse(data) as EncryptedData;

                return crypto.enc.Utf8.stringify(crypto.AES.decrypt(cipher, key, {
                    iv: crypto.enc.Base64.parse(iv)
                }));
            } catch (e) {
                console.error(e);
                return null;
            }
        },
    };

    return <EncryptionManagerContext.Provider value={encryptionManager}>
        {children}
    </EncryptionManagerContext.Provider>;
}
