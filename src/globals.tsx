/// <reference types="vite-plugin-svgr/client" />

import {SvgIconComponent} from "@mui/icons-material";
import PaidIcon from "@mui/icons-material/Paid";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import StoreIcon from "@mui/icons-material/Store";
import CommentIcon from "@mui/icons-material/Comment";
import EmailIcon from "@mui/icons-material/Email";
import KeyIcon from '@mui/icons-material/Key';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import {Language, LanguageDescription} from "./managers/localization.tsx";

export const icons: Record<string, SvgIconComponent> = {
    "money": PaidIcon,
    "wallet": AccountBalanceWalletIcon,
    "store": StoreIcon,
    "comment": CommentIcon,
    "email": EmailIcon,
    "key": KeyIcon,
    "cloud": CloudIcon,
    "storage": StorageIcon,
} as const;

type Icons = keyof typeof icons;
export type Icon = Icons[number];

export const colors: string[] = [
    "#1c98e6", "#2e7d32", "#ed6c02", "#9c27b0", "#d32f2f", "#0288d1",
] as const;

export type Color = string;

export const languages = ["en", "ru", "uk", "de", "fr", "es", "hi", "pt"] as const;
export const languageDescriptions: Record<Language, LanguageDescription> = {
    "en": {
        native: "English",
        default: "English"
    },
    "ru": {
        native: "Русский",
        default: "Russian"
    },
    "uk": {
        native: "Українська",
        default: "Ukrainian"
    },
    "de": {
        native: "Deutsch",
        default: "German"
    },
    "fr": {
        native: "Français",
        default: "French"
    },
    "es": {
        native: "Español",
        default: "Spanish"
    },
    "hi": {  
        native: "हिन्दी",
        default: "Hindi"
    },
    "pt": {
        native: "Português",
        default: "Portuguese",
    },
} as const;
export const defaultLanguage: Language = "en";
