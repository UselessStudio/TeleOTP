import {useLocation, useNavigate} from "react-router-dom";
import {useCallback, useEffect} from "react";

/**
 * This hook sends a request to telegram to display button to navigate back in history.
 * It is used only once in Root. tsx. This hook automatically shows the button if the current route is not root (/).
 * To navigate back, useNavigate(-1) hook from React Router is used.
 */
export default function useTelegramBackButton() {
    const navigate = useNavigate();
    const location = useLocation();
    const goBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    useEffect(() => {
        window.Telegram.WebApp.BackButton.onClick(goBack);

        return () => {
            window.Telegram.WebApp.BackButton.offClick(goBack);
        }
    }, [goBack]);

    useEffect(()=>{
        if(location.key != "default" && location.pathname !== "/") {
            window.Telegram.WebApp.BackButton.show();
        } else {
            window.Telegram.WebApp.BackButton.hide();
        }
    }, [location]);
}
