import de from "lib/lang/de";
import en from "lib/lang/en";
import es from "lib/lang/es";
import fr from "lib/lang/fr";
import hi from "lib/lang/hi";
import pt from "lib/lang/pt";
import ru from "lib/lang/ru";
import uk from "lib/lang/uk";

const translations = { de, en, es, fr, hi, pt, ru, uk };

export function getTranslation(languageCode) {
    return translations[languageCode] ?? en;
}
