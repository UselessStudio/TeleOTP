/// <reference types="vite-plugin-svgr/client" />

import {SvgIconComponent} from "@mui/icons-material";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import RedditIcon from "@mui/icons-material/Reddit";
import PinterestIcon from "@mui/icons-material/Pinterest";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PaidIcon from "@mui/icons-material/Paid";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import StoreIcon from "@mui/icons-material/Store";
import CommentIcon from "@mui/icons-material/Comment";
import EmailIcon from "@mui/icons-material/Email";
import {createSvgIcon} from "@mui/material";

import Discord from "./assets/icons/discord.svg?react";
import Vk from "./assets/icons/vk.svg?react";
import Pterodactyl from "./assets/icons/pterodactyl.svg?react";
import Docker from "./assets/icons/docker.svg?react";
import Npm from "./assets/icons/npm.svg?react";

const DiscordIcon = createSvgIcon(<Discord/>, "Discord");
const VkIcon = createSvgIcon(<Vk viewBox="-4 -4 32 32"/>, "Vk");
const PterodactylIcon = createSvgIcon(<Pterodactyl/>, "Pterodactyl");
const DockerIcon = createSvgIcon(<Docker/>, "Docker");
const NpmIcon = createSvgIcon(<Npm viewBox="-4 -4 32 32"/>, "Npm");

export const icons: Record<string, SvgIconComponent> = {
    "github": GitHubIcon,
    "google": GoogleIcon,
    "facebook": FacebookIcon,
    "twitter": TwitterIcon,
    "instagram": InstagramIcon,
    "reddit": RedditIcon,
    "pinterest": PinterestIcon,
    "linkedin": LinkedInIcon,
    "money": PaidIcon,
    "wallet": AccountBalanceWalletIcon,
    "store": StoreIcon,
    "comment": CommentIcon,
    "email": EmailIcon,
    "discord": DiscordIcon,
    "vk": VkIcon,
    "pterodactyl": PterodactylIcon,
    "docker": DockerIcon,
    "npm": NpmIcon,
} as const;

type Icons = keyof typeof icons;
export type Icon = Icons[number];

export const colors = [
    "primary", "success", "warning", "secondary", "error", "info",
] as const;

type Colors = typeof colors;
export type Color = Colors[number];