import {ThemeProvider} from "@mui/material";
import {Outlet, useNavigate} from "react-router-dom";
import {FC, useContext, useEffect} from "react";
import useTelegramBackButton from "./hooks/telegram/useTelegramBackButton.ts";
import useTelegramTheme from "./hooks/telegram/useTelegramTheme.ts";
import {EncryptionManagerContext} from "./providers/encryption.tsx";

const Root: FC = () => {
    useTelegramBackButton();
    const theme = useTelegramTheme();
    const navigate = useNavigate();
    const encryptionManager = useContext(EncryptionManagerContext);

    useEffect(() => {
        if (encryptionManager?.isLocked) {
            navigate("/decrypt", {replace: true});
        } else {
            navigate("/", {replace: true});
        }
    }, [encryptionManager?.isLocked, navigate]);

    return (
    <>
        <ThemeProvider theme={theme}>
            <Outlet/>
        </ThemeProvider>
    </>
  )
}

export default Root
