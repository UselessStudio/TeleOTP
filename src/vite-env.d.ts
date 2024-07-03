/// <reference types="vite/client" />
declare const APP_VERSION: string;
declare const APP_HOMEPAGE: string;

interface ImportMetaEnv {
    readonly VITE_BOT_USERNAME: string;
    readonly VITE_PLAUSIBLE_API_HOST: string;
    readonly VITE_PLAUSIBLE_DOMAIN: string;
    readonly BASE_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
