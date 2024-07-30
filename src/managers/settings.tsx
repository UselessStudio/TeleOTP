import {createContext, FC, PropsWithChildren, useState} from "react";

/**
 * SettingsManager is used to provide the app with user's preferences.
 * Currently, SettingsManager stores settings in the localStorage, so the state is NOT persistent between devices,
 * even on the same Telegram account.
 *
 * To get an instance of SettingsManager, you should use the useContext hook:
 * @example
 * const settingsManager = useContext(SettingsManagerContext);
 */
export interface SettingsManager {
    /**
     * This flag indicates whether the app should stay in the unlocked state between restarts.
     */
    shouldKeepUnlocked: boolean;

    /**
     * This method changes the value of the shouldKeepUnlocked flag.
     * @param keep - the new value
     */
    setKeepUnlocked(keep: boolean): void;

    /**
     * This value contains the id of the account that was previously selected.
     * If this value is missing in the storage, returns null.
     * @note The id returned in this method is NOT checked to be a valid account id.
     */
    lastSelectedAccount: string | null;

    /**
     * This method updates the last selected account value in the storage.
     * @param id - the account id
     */
    setLastSelectedAccount(id: string): void;

    /**
     * This flag indicates whether the user has enabled biometric unlock and saved the token.
     */
    biometricsEnabled: boolean;

    /**
     * This method updates the state of biometric unlock flag.
     * @param enabled - the state
     */
    setBiometricsEnabled(enabled: boolean): void;

}

export const SettingsManagerContext = createContext<SettingsManager | null>(null);

/**
 * SettingsManager is created using SettingsManagerProvider component.
 */
export const SettingsManagerProvider: FC<PropsWithChildren> = ({ children }) => {
    const [shouldKeepUnlocked, setKeepUnlocked] = useState<boolean>(() => {
        const item = localStorage.getItem("keepUnlocked");
        return item ? JSON.parse(item) as boolean : true;
    });
    const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(() => {
        const item = localStorage.getItem("biometricsEnabled");
        return item ? JSON.parse(item) as boolean : false;
    });
    const [lastSelectedAccount, setLastSelectedAccount] = useState<string | null>(() => {
        return localStorage.getItem("lastSelectedAccount");
    });

    const settingsManager: SettingsManager = {
        lastSelectedAccount,
        setLastSelectedAccount(id: string) {
            setLastSelectedAccount(id);
            localStorage.setItem("lastSelectedAccount", id);
        },
        shouldKeepUnlocked,
        setKeepUnlocked(keep: boolean) {
            setKeepUnlocked(keep);
            localStorage.setItem("keepUnlocked", JSON.stringify(keep));
        },
        biometricsEnabled,
        setBiometricsEnabled(enable: boolean) {
            setBiometricsEnabled(enable);
            localStorage.setItem("biometricsEnabled", JSON.stringify(enable));
        },

    };

    return <SettingsManagerContext.Provider value={settingsManager}>
        {children}
    </SettingsManagerContext.Provider>
};
