import { WEB_APP_URL } from "lib/config";
import { getTranslation } from "lib/lang/index";
import { api } from "sdk";

export default async function handleMessage(message) {
    const translation = getTranslation(message.from?.language_code);

    await api.sendMessage({
        chat_id: message.chat.id,
        text: [
            translation.Welcome,
            translation.ICanHelp,
            translation.ClickButton,
        ].join("\n"),
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: translation.ButtonText,
                        web_app: { url: WEB_APP_URL },
                    },
                ],
            ],
        },
    });
}
