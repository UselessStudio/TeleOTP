import {useContext} from "react";
import {LocalizationManagerContext} from "../managers/localization.tsx";

export function useL10n() {
    const localizationManager = useContext(LocalizationManagerContext);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return localizationManager!.l10n.bind(localizationManager);
}
