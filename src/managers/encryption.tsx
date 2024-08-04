import {createContext, FC, PropsWithChildren, useContext, useEffect, useState} from "react";
import * as crypto from "crypto-js";
import {SettingsManagerContext} from "./settings.tsx";
import {BiometricsManagerContext} from "./biometrics.tsx";

const kdfOptions = {keySize: 256 / 8};
const saltBytes = 128 / 8;
const ivBytes = 128 / 8;
const keyCheckValuePlaintext = "key-check-value";

/**
 * EncryptionManager is used to handle everything related to encryption.
 * It is responsible for unlocking the storage, checking passwords, and encrypting/decrypting data.
 * Currently, AES-128 encryption and PBKDF2 key derive function are implemented.
 *
 * The actual encryption methods used are implemented in the CryptoJS library.
 *
 * User's password is not stored anywhere outside the device itself.
 * Instead, Key Checksum Value is used to verify the validity of the entered key.
 * After a successful password entry, the derived key is stored in the localStorage (if not disabled in settings).
 *
 * To get an instance of EncryptionManager, you should use the useContext hook:
 * @example
 * const encryptionManager = useContext(EncryptionManagerContext);
 */
export interface EncryptionManager {
    /**
     * This is a boolean indicating if KCV and password salt were read from the storage.
     * The app should wait for this value to be true to try to unlock the EncryptionManager or use encrypt/decrypt methods.
     */
    storageChecked: boolean;
    /**
     * This flag indicates that the password exists, and it's salt and KCV are in the storage.
     * Its value is null when EncryptionManager haven't checked the storage yet.
     */
    passwordCreated: boolean | null;

    /**
     * This method is used to create a new password or change the existing one.
     * If this method is called with the EncryptionManager being unlocked, the previous key is stored in the oldKey variable.
     * @param password - The new password. It should be provided in the plaintext form.
     */
    createPassword(password: string): void;

    /**
     * This method removes the salt and KCV from the storage. After it is called, passwordCreated would become false.
     */
    removePassword(): void;

    /**
     * This method saves the current key as a biometric token to the storage on device.
     */
    saveBiometricToken(): void;

    /**
     * This method removes the current key from the biometric storage on device.
     */
    removeBiometricToken(): void;

    /**
     * This flag indicates whether EncryptionManager is locked or not.
     * If it is equal to true, the user should unlock the storage using the unlock method
     */
    isLocked: boolean;

    /**
     * This method takes in the plaintext password from the user, verifies the validity using KCV,
     * and stores the key locally in case of success. After the successful execution of this method,
     * isLocked would change to false.
     * @param password - a boolean indicating whether the provided password is correct.
     */
    unlock(password: string): boolean;

    /**
     * This method tries to unlock the storage by using the biometric token. The behaviour is the same as `unlock`.
     */
    unlockBiometrics(): void;

    /**
     * This method removes the stored key from localStorage After the execution of this method,
     * isLocked would change to true.
     */
    lock(): void;

    /**
     * This variable contains the previous password's key.
     * It is used to indicate that the password was changed to re-encrypt the accounts with the correct new key.
     */
    oldKey: crypto.lib.WordArray | null;

    /**
     * This method encrypts the `data` string with the stored key and returns the corresponding ciphertext.
     * This method will return null if the EncryptionManager is locked.
     * @param data - string to be encrypted
     */
    encrypt(data: string): string | null;

    /**
     * This method decrypts the data string with the stored key and returns the corresponding plaintext.
     * This method will return null if the EncryptionManager is locked.
     * @param data - string to be decrypted
     */
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

/**
 * EncryptionManager is created using EncryptionManagerProvider component.
 *
 * @note EncryptionManagerProvider must be used inside the SettingsManagerProvider
 */
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
