/// <reference types="vite/client" />
declare const APP_VERSION: string;
declare const APP_HOMEPAGE: string;

interface ImportMetaEnv {
    readonly VITE_BOT_USERNAME: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
