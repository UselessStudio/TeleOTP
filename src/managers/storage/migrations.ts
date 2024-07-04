import { Migrations } from "./migrate";
import { icons } from "../../globals";
import {ICONS_CDN, titleToIconSlug} from "../../icons/icons.ts";

type V1Color = [
    "primary", "success", "warning", "secondary", "error", "info",
][number];

export const MIGRATIONS_SCHEMA: Migrations = [
    {
        from: "1",
        to: "2",
        up: (account) => {
            function convertV1Icon(icon: string): string {
                if (Object.keys(icons).includes(icon)) return icon;
                if (icon == "twitter") icon = "x"; // thanks, Elon

                // prevent not simpleicons urls
                if (icon.startsWith("https://") && !icon.includes(ICONS_CDN)) {
                    return "store";
                }

                return titleToIconSlug(icon);
            }
            function convertV1Color(color: V1Color): string {
                switch (color) {
                    case "primary":
                        return "#1976d2";
                    case "secondary":
                        return "#9c27b0";
                    case "info":
                        return "#0288d1";
                    case "success":
                        return "#2e7d32";
                    case "warning":
                        return "#ed6c02";
                    case "error":
                        return "#d32f2f";
                    default:
                        return color;
                }
            }
            import.meta.env.DEV &&
                console.log(
                    "converted color from",
                    account.color,
                    "to",
                    convertV1Color(account.color as V1Color),
                    {
                        ...account,

                        color: convertV1Color(account.color as V1Color),
                        icon: convertV1Icon(account.icon),
                        order: -1,
                    }
                );
            return {
                ...account,

                color: convertV1Color(account.color as V1Color),
                icon: convertV1Icon(account.icon),
                order: -1,
            };
        },
    },
];
