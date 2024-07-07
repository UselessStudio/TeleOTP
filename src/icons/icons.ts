export const ICONS_CDN_BASE = "https://cdn.jsdelivr.net/npm/simple-icons@13.0.0";
export const ICONS_CDN = ICONS_CDN_BASE + "/icons";
export const ICONS_DATA_URL = ICONS_CDN_BASE + "/_data/simple-icons.json";

// from https://github.com/simple-icons/simple-icons/blob/master/sdk.mjs
const TITLE_TO_SLUG_REPLACEMENTS: Record<string, string> = {
    "+": "plus",
    ".": "dot",
    "&": "and",
    "#": "sharp",
    "đ": "d",
    "ħ": "h",
    "ı": "i",
    "ĸ": "k",
    "ŀ": "l",
    "ł": "l",
    "ß": "ss",
    "ŧ": "t",
};

const TITLE_TO_SLUG_CHARS_REGEX = new RegExp(
    `[${Object.keys(TITLE_TO_SLUG_REPLACEMENTS).join("")}]`,
    "g"
);
const TITLE_TO_SLUG_RANGE_REGEX = /[^a-z\d]/g;

export function titleToIconSlug(title: string): string {
    const exceptions: Record<string, string> = {
        "Amazon Identity Access Management": "amazoniam",
        "del.icio.us": "delicious",
        "Ferrari N.V.": "ferrarinv",
        "OWASP Dependency-Check": "dependencycheck",
        "Sat.1": "sat1",
        "Sphere Online Judge": "spoj",
        "Tata Consultancy Services": "tcs",
        "Warner Bros.": "warnerbros",
    };
    if (exceptions[title]) return exceptions[title];
    return title
        .toLowerCase()
        .replace(
            TITLE_TO_SLUG_CHARS_REGEX,
            (char) => TITLE_TO_SLUG_REPLACEMENTS[char]
        )
        .normalize("NFD")
        .replace(TITLE_TO_SLUG_RANGE_REGEX, "");
}

export function iconUrl(slug: string) {
    return `${ICONS_CDN}/${slug}.svg`;
}
