import {createContext, FC, PropsWithChildren, useState} from "react";

export interface SettingsManager {
    shouldKeepUnlocked: boolean;
    setKeepUnlocked(keep: boolean): void;
}

export const SettingsManagerContext = createContext<SettingsManager | null>(null);

export const SettingsManagerProvider: FC<PropsWithChildren> = ({ children }) => {
    const [shouldKeepUnlocked, setKeepUnlocked] = useState<boolean>(() => {
        const item = localStorage.getItem("keepUnlocked");
        return item ? JSON.parse(item) as boolean : true;
    });

    const settingsManager: SettingsManager = {
        shouldKeepUnlocked,
        setKeepUnlocked(keep: boolean) {
            setKeepUnlocked(keep);
            localStorage.setItem("keepUnlocked", JSON.stringify(keep));
        }
    };

    return <SettingsManagerContext.Provider value={settingsManager}>
        {children}
    </SettingsManagerContext.Provider>
};