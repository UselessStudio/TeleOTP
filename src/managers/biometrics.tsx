import {createContext, FC, PropsWithChildren, useContext, useEffect, useState} from "react";
import {SettingsManagerContext} from "./settings.tsx";

export const BiometricsManagerContext = createContext<BiometricsManager | null>(null);

export interface BiometricsManager {
    isAvailable: boolean;
    isSaved: boolean;
    updateToken(token: string): void;
    getToken(callback: (token?: string) => void): void;
}
export interface BiometricsManagerProps {
    requestReason: string,
    authenticateReason: string
}

export const BiometricsManagerProvider: FC<PropsWithChildren<BiometricsManagerProps>> = (
    {children, requestReason, authenticateReason }) => {
    const [isAvailable, setIsAvailable] = useState(false);
    const [isRequested, setIsRequested] = useState(false);
    const settingsManager = useContext(SettingsManagerContext);

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
                window.Telegram.WebApp.BiometricManager.openSettings();
                window.Telegram.WebApp.BiometricManager.requestAccess({
                    reason: requestReason
                }, (success) => {
                    if (success) {
                        window.Telegram.WebApp.BiometricManager.updateBiometricToken(token, () => {
                            settingsManager?.setBiometricsEnabled(token !== '' && success);
                        });
                    }
                });
            } else {
                window.Telegram.WebApp.BiometricManager.updateBiometricToken(token, (success) => {
                    settingsManager?.setBiometricsEnabled(token !== '' && success);
                });
            }
        },
        getToken: (callback: (token?: string) => void) => {
            if(!isAvailable || !isSaved || isRequested) return;
            console.log(window.Telegram.WebApp.BiometricManager.isAccessRequested);
            setIsRequested(true);
            try {
                window.Telegram.WebApp.BiometricManager.authenticate({
                    reason: authenticateReason,
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