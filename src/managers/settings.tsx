import {createContext, FC, PropsWithChildren, useState} from "react";

export interface SettingsManager {
    shouldKeepUnlocked: boolean;
    setKeepUnlocked(keep: boolean): void;
    lastSelectedAccount: string | null;
    setLastSelectedAccount(id: string): void;
    biometricsEnabled: boolean;
    setBiometricsEnabled(enabled: boolean): void;

}

export const SettingsManagerContext = createContext<SettingsManager | null>(null);

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