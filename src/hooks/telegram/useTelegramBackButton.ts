import {useLocation, useNavigate} from "react-router-dom";
import {useEffect} from "react";

export default function useTelegramBackButton() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        function goBack() {
            navigate(-1);
        }
        window.Telegram.WebApp.BackButton.onClick(goBack);

        return () => {
            window.Telegram.WebApp.BackButton.offClick(goBack);
        }
    }, [navigate]);

    useEffect(()=>{
        if(location.key != "default" && location.pathname !== "/") {
            window.Telegram.WebApp.BackButton.show();
        } else {
            window.Telegram.WebApp.BackButton.hide();
        }
    }, [location]);
}
