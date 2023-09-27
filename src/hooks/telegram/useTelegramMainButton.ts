import {useEffect} from "react";

export default function useTelegramMainButton(onClick: () => boolean, text: string) {
    useEffect(() => {
        window.Telegram.WebApp.MainButton.setText(text);
        window.Telegram.WebApp.MainButton.show();
        return () => {
            window.Telegram.WebApp.MainButton.hide();
        }
    }, [text]);

    useEffect(() => {
        function handler() {
            if(onClick()) {
                window.Telegram.WebApp.MainButton.hide();
            }
        }

        window.Telegram.WebApp.MainButton.onClick(handler);
        return () => {
            window.Telegram.WebApp.MainButton.offClick(handler);
        }
    }, [onClick]);
}