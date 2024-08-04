import {useEffect} from "react";

/**
 * Hook, that allows to set the app's header color.
 * @param color - hex color, don't pass the color to set to default.
 */
export default function useTelegramHeaderColor(color?: `#${string}`) {
    useEffect(() => {
        window.Telegram.WebApp.setHeaderColor(color ?? "bg_color")

        return () => {
            window.Telegram.WebApp.setHeaderColor("bg_color");
        }
    }, [color]);
}
