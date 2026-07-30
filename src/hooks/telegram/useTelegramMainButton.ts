import { useEffect } from "react";
import useTelegramTheme from "./useTelegramTheme";

/**
 * This hook shows a main button and adds the callback as the listener for clicks.
 * The button is automatically hidden if the component using this hook is disposed.
 * @param onClick - a callback that is executed when user presses the button.
 * If the callback returns true, the button will be hidden.
 * @param text - a string which contains the text that should be displayed on the button.
 * @param [disabled = false] - a boolean flag that indicates, whether the button should be disabled or not.
 * @param [loading = false] - whether Telegram's native progress indicator should be displayed.
 */
export default function useTelegramMainButton(
    onClick: () => boolean | Promise<boolean>,
    text: string,
    disabled = false,
    loading = false,
) {
    const { palette } = useTelegramTheme();

    useEffect(() => {
        window.Telegram.WebApp.MainButton.setText(text);
        window.Telegram.WebApp.MainButton.show();
        return () => {
            window.Telegram.WebApp.MainButton.hide();
        };
    }, [text]);

    useEffect(() => {
        async function handler() {
            if (await onClick()) {
                window.Telegram.WebApp.MainButton.hide();
            }
        }

        window.Telegram.WebApp.MainButton.onClick(handler);
        return () => {
            window.Telegram.WebApp.MainButton.offClick(handler);
        };
    }, [onClick]);

    useEffect(() => {
        if (loading) {
            window.Telegram.WebApp.MainButton.showProgress(false);
        } else {
            window.Telegram.WebApp.MainButton.hideProgress();
        }
        return () => window.Telegram.WebApp.MainButton.hideProgress();
    }, [loading]);

    useEffect(() => {
        if (disabled) {
            window.Telegram.WebApp.MainButton.disable();
            window.Telegram.WebApp.MainButton.color =
                palette.mode === "light"
                    ? (palette.action.disabled as `#${string}`)
                    : ("#858585" as `#${string}`);
        } else {
            window.Telegram.WebApp.MainButton.enable();
            window.Telegram.WebApp.MainButton.color = palette.primary
                .main as `#${string}`;
        }
    }, [disabled, palette.primary.main, palette.mode, palette.action.disabled]);
}
