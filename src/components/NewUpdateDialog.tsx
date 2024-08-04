import {FC, PropsWithChildren, useEffect} from "react";
import {useL10n} from "../hooks/useL10n.ts";

const NewUpdateDialog: FC<PropsWithChildren> = function () {
    const l10n = useL10n();
    useEffect(() => {

        window.Telegram.WebApp.CloudStorage.getItem("dialogSeen", (error, result) => {
            if(error) return;
            if (result !== "true") {
                window.Telegram.WebApp.showPopup({
                    title: l10n("NewUpdateTitle"),
                    message: l10n("NewUpdateText"),
                    buttons: [
                        {type: "default", text: l10n("ActionLearnMore"), id: "open"},
                        {type: "close"},
                    ]
                }, (id) => {
                    if (id == "open") {
                        window.Telegram.WebApp.openTelegramLink(import.meta.env.VITE_CHANNEL_LINK);
                    }
                });
                window.Telegram.WebApp.CloudStorage.setItem("dialogSeen", "true");
            }
        });
    }, []);

    return (<></>);
};

export default NewUpdateDialog;
