import { useEffect, useState } from "react";
import { createTheme, Theme } from "@mui/material";
import { ThemeParams } from "@twa-dev/types";

function materialThemeFromTelegramTheme(
    mode: "light" | "dark",
    themeParams?: ThemeParams
): Theme {
    // Create a default theme if not supplied by Telegram (i.e. when testing in a browser)
    if (themeParams?.button_color == undefined) {
        return createTheme();
    }

    return createTheme({
        palette: {
            primary: {
                main: themeParams.button_color,
                contrastText: themeParams.button_text_color,
            },
            error: {
                main: themeParams.destructive_text_color,
            },
            background: {
                default: themeParams.secondary_bg_color,
                paper: themeParams.section_bg_color,
            },
            action: {
                disabled: "#9E9E9E",
            },
            text: {
                primary: themeParams.text_color,
                secondary: themeParams.hint_color,
            },
            divider: themeParams.hint_color,
            mode,
        },
        typography: {
            fontFamily: [
                "Inter",
                '"Helvetica Neue"',
                "Arial",
                "sans-serif",
            ].join(","),
            allVariants: {
                color: themeParams.text_color,
            },
            subtitle1: {
                color: themeParams.hint_color,
            },
            subtitle2: {
                color: themeParams.hint_color,
            },
        },
    });
}

/**
 * Creates a Material UI theme from Telegram-provided color palette. This hook automatically listens for theme change events.
 * @returns A Material UI theme, to be used with ThemeProvider
 */
export default function useTelegramTheme() {
    const [theme, setTheme] = useState(
        materialThemeFromTelegramTheme(
            window.Telegram.WebApp.colorScheme,
            window.Telegram.WebApp.themeParams
        )
    );
    useEffect(() => {
        function themeChanged() {
            setTheme(
                materialThemeFromTelegramTheme(
                    window.Telegram.WebApp.colorScheme,
                    window.Telegram.WebApp.themeParams
                )
            );
        }

        window.Telegram.WebApp.onEvent("themeChanged", themeChanged);

        return () => {
            window.Telegram.WebApp.offEvent("themeChanged", themeChanged);
        };
    });

    return theme;
}
