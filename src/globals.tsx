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
