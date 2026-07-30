import { useContext } from "react";
import { LocalizationManagerContext } from "../managers/localization.tsx";

export function useL10n() {
    const localizationManager = useContext(LocalizationManagerContext);
    // biome-ignore lint/style/noNonNullAssertion: This hook is only used inside LocalizationManagerProvider.
    return localizationManager!.l10n.bind(localizationManager);
}
