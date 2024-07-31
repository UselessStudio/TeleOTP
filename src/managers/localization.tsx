import {createContext, FC, PropsWithChildren, useContext, useEffect, useState} from "react";
import { lang } from "../lang/en.ts";
import {defaultLanguage, languages} from "../globals.tsx";
import {SettingsManagerContext} from "./settings.tsx";

export type LangKey = keyof typeof lang;
export type Translations = Partial<Record<LangKey, string>>;
export type Language = typeof languages[number];
export interface LanguageDescription {
    native: string;
    default: string;
}

import { lang as defaultTranslations } from "../lang/en.ts";

/**
 * LocalizationManager is used to provide strings for multiple languages.
 *
 * To get an instance of LocalizationManager, you should use the useContext hook:
 * @example
 * const localizationManager = useContext(LocalizationManagerContext);
 */
export interface LocalizationManager {
    l10n(key: LangKey): string;
}

export const LocalizationManagerContext = createContext<LocalizationManager | null>(null);

/**
 * LocalizationManager is created using LocalizationManagerProvider component.
 *
 * @note LocalizationManagerProvider must be used inside the SettingsManagerProvider
 */
export const LocalizationManagerProvider: FC<PropsWithChildren> = ({ children }) => {
    const settingsManager = useContext(SettingsManagerContext);
    const lang = settingsManager?.selectedLanguage ?? defaultLanguage;
    const [translations, setTranslations] = useState<Translations>(defaultTranslations);
    useEffect(() => {
        if(!languages.includes(lang)) return;
        void import(`../lang/${lang}.ts`).then(translations => {
            setTranslations(translations.lang);
        });
    }, [lang]);
    const localizationManager: LocalizationManager = {
        l10n(key: LangKey): string {
            if(key in translations) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return translations[key]!;
            } else {
                return defaultTranslations[key];
            }
        }
    };

    return <LocalizationManagerContext.Provider value={localizationManager}>
        {children}
    </LocalizationManagerContext.Provider>;
};
