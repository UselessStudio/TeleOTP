import {FC, useContext} from "react";
import {Button, Stack} from "@mui/material";
import {StorageManagerContext} from "../providers/storage.tsx";
import {EncryptionManagerContext} from "../providers/encryption.tsx";

const Settings: FC = () => {
    const storageManager = useContext(StorageManagerContext);
    const encryptionManager = useContext(EncryptionManagerContext);

    // TODO: design
    return <Stack spacing={2}>
        <Button variant="contained" color="error" onClick={() => {
            window.Telegram.WebApp.showPopup({
                message: "Are you sure you want to delete ALL your accounts?",
                buttons: [
                    {type: "destructive", text: "Yes", id: "remove"},
                    {type: "cancel", id: "cancel"},
                ]
            }, (id) => {
                if (id !== "remove") return;
                storageManager?.clearStorage();
            });
        }}>
            Clear
        </Button>
        <Button variant="contained" color="warning" onClick={() => {
            encryptionManager?.lock();
        }}>Lock</Button>
    </Stack>
}

export default Settings;