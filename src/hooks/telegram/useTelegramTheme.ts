import {useEffect, useState} from "react";
import {createTheme, Theme} from "@mui/material";
import {ThemeParams} from "@twa-dev/types";

function materialThemeFromTelegramTheme(mode: "light" | "dark", themeParams?: ThemeParams): Theme {
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
            background: {
                default: themeParams.secondary_bg_color,
                paper: themeParams.bg_color,
            },
            text: {
                primary: themeParams.text_color,
            },
            mode
        },
        typography: {
            allVariants: {
                color: themeParams.text_color,
            },
            subtitle1: {
                color: themeParams.hint_color,
            },
            subtitle2: {
                color: themeParams.hint_color,
            }
        },

    });
}

export default function useTelegramTheme() {
    const [theme, setTheme] = useState(materialThemeFromTelegramTheme(
        window.Telegram.WebApp.colorScheme,
        window.Telegram.WebApp.themeParams
    ));
    useEffect(() => {
        window.Telegram.WebApp.onEvent("themeChanged", () => {
            setTheme(materialThemeFromTelegramTheme(
                window.Telegram.WebApp.colorScheme,
                window.Telegram.WebApp.themeParams
            ));
        });
    });

    return theme;
}