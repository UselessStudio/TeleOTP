import {FC, PropsWithChildren, useEffect} from "react";

const NewUpdateDialog: FC<PropsWithChildren> = function () {
    useEffect(() => {

        window.Telegram.WebApp.CloudStorage.getItem("dialogSeen", (error, result) => {
            if(error) return;
            if (result !== "true") {
                window.Telegram.WebApp.showPopup({
                    title: "Like TeleOTP?",
                    message: "Stay tuned for announcements and new releases in our channel",
                    buttons: [
                        {type: "default", text: "Learn more", id: "open"},
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
