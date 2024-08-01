import {createContext, FC, PropsWithChildren, useContext, useEffect, useState} from "react";
import {SettingsManagerContext} from "./settings.tsx";
import {useL10n} from "../hooks/useL10n.ts";

export const BiometricsManagerContext = createContext<BiometricsManager | null>(null);

/**
 * BiometricsManager is used as an interface to Telegram's `WebApp.BiometricManager`.
 * It allows to store the encryption key inside secure storage on device, locked by a biometric lock.
 *
 * To get an instance of BiometricsManager, you should use the useContext hook:
 * @example
 * const biometricsManager = useContext(BiometricsManagerContext);
 */
export interface BiometricsManager {
    /**
     * Boolean flag indicating whether biometric storage is available on the current device.
     */
    isAvailable: boolean;
    /**
     * Boolean flag indicating whether the encryption key is saved inside the storage. This flag is stored using the SettingsManager.
     */
    isSaved: boolean;

    /**
     * This method saves the key inside secure storage. It may ask the user for necessary permissions.
     * @param token - token to be saved. To delete the stored key, pass empty string.
     */
    updateToken(token: string): void;

    /**
     * This method requests a token from the storage.
     * @param callback If a request is successful,
     * the token is passed in the token parameter inside a callback.
     * In case of a failure, callback is called with empty token.
     */
    getToken(callback: (token?: string) => void): void;
}

/**
 * BiometricsManager is created using BiometricsManagerProvider component
 *
 * @note BiometricsManagerProvider must be used inside the SettingsManagerProvider
 */
export const BiometricsManagerProvider: FC<PropsWithChildren> = ({ children }) => {
    const [isAvailable, setIsAvailable] = useState(false);
    const [isRequested, setIsRequested] = useState(false);
    const settingsManager = useContext(SettingsManagerContext);
    const l10n = useL10n();

    useEffect(() => {
        window.Telegram.WebApp.BiometricManager.init(() => {
            setIsAvailable(window.Telegram.WebApp.BiometricManager.isInited &&
                window.Telegram.WebApp.BiometricManager.isBiometricAvailable);
            if (!window.Telegram.WebApp.BiometricManager.isAccessGranted) {
                settingsManager?.setBiometricsEnabled(false);
            }
        });
    }, [settingsManager]);

    const isSaved = settingsManager?.biometricsEnabled ?? false;
    const biometricsManager: BiometricsManager = {
        isAvailable,
        isSaved,
        updateToken: (token: string) => {
            if(!isAvailable) return;
            if(!window.Telegram.WebApp.BiometricManager.isAccessGranted) {
                window.Telegram.WebApp.BiometricManager.requestAccess({
                    reason: l10n("BiometricsRequestReason")
                }, (success) => {
                    if (!success) {
                        window.Telegram.WebApp.BiometricManager.openSettings();
                    }
                    window.Telegram.WebApp.BiometricManager.updateBiometricToken(token, () => {
                        settingsManager?.setBiometricsEnabled(token !== '' && success);
                    });
                });
            } else {
                window.Telegram.WebApp.BiometricManager.updateBiometricToken(token, (success) => {
                    if(!success) {
                        window.Telegram.WebApp.BiometricManager.openSettings();
                    }
                    settingsManager?.setBiometricsEnabled(token !== '' && success);
                });
            }
        },
        getToken: (callback: (token?: string) => void) => {
            if(!isAvailable || !isSaved || isRequested) return;
            setIsRequested(true);
            try {
                window.Telegram.WebApp.BiometricManager.authenticate({
                    reason: l10n("BiometricsAuthenticateReason"),
                }, (_success, token?: string) => {
                    setIsRequested(false);
                    callback(token);
                });
            } catch (e) {
                // ignore for react strict mode compatibility
            }

        }
    };
    return <BiometricsManagerContext.Provider value={biometricsManager}>
        {children}
    </BiometricsManagerContext.Provider>;
}
