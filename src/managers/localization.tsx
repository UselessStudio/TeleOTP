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
    /**
     * Get the translation for the string in the current language.
     * @param key - the lang key, defined in the default language (`en.ts`)
     * @param args - optional variables to be replaced in the string
     */
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    l10n(key: LangKey, args?: Record<string, any>): string;
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
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        l10n(key: LangKey, args?: Record<string, any>): string {
            let template: string;
            if(key in translations) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                template = translations[key]!;
            } else {
                template = defaultTranslations[key];
            }

            if(!args) return template;
            for (const placeholder in args) {
                template = template.replace(new RegExp("\\{" + placeholder + "\\}", "gi"), args[placeholder]);
            }

            return template;
        }
    };

    return <LocalizationManagerContext.Provider value={localizationManager}>
        {children}
    </LocalizationManagerContext.Provider>;
};
