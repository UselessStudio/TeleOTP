import {createContext, FC, PropsWithChildren, useState} from "react";

export interface EncryptionManager {
    isLocked: boolean;
    unlock(password: string): boolean;
    lock(): void;
}

export const EncryptionManagerContext = createContext<EncryptionManager | null>(null);

export const EncryptionManagerProvider: FC<PropsWithChildren> = ({ children }) => {
    const [password, setPassword] = useState<string | null>(null);
    const encryptionManager: EncryptionManager = {
        isLocked: password === null,
        unlock: enteredPassword => {
            if (enteredPassword === "123") {
                setPassword(enteredPassword);
                return true;
            }

            return false;
        },
        lock: () => {
            setPassword(null);
        },
    };

    return <EncryptionManagerContext.Provider value={encryptionManager}>
        {children}
    </EncryptionManagerContext.Provider>;
}