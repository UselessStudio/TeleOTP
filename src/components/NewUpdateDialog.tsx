import { type FC, type PropsWithChildren, useEffect } from "react";
import { useL10n } from "../hooks/useL10n.ts";

const NewUpdateDialog: FC<PropsWithChildren> = () => {
    const l10n = useL10n();
    const title = l10n("NewUpdateTitle");
    const message = l10n("NewUpdateText");
    const learnMoreText = l10n("ActionLearnMore");

    useEffect(() => {
        window.Telegram.WebApp.CloudStorage.getItem(
            "dialogSeen",
            (error, result) => {
                if (error) return;
                if (result !== "true") {
                    window.Telegram.WebApp.showPopup(
                        {
                            title,
                            message,
                            buttons: [
                                {
                                    type: "default",
                                    text: learnMoreText,
                                    id: "open",
                                },
                                { type: "close" },
                            ],
                        },
                        (id) => {
                            if (id === "open") {
                                window.Telegram.WebApp.openTelegramLink(
                                    import.meta.env.VITE_CHANNEL_LINK,
                                );
                            }
                        },
                    );
                    window.Telegram.WebApp.CloudStorage.setItem(
                        "dialogSeen",
                        "true",
                    );
                }
            },
        );
    }, [learnMoreText, message, title]);

    return null;
};

export default NewUpdateDialog;
