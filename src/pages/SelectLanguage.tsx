import {useContext} from "react";
import {SettingsManagerContext} from "../managers/settings.tsx";
import {Divider, List, ListItemButton, ListItemIcon, ListItemText, Radio} from "@mui/material";
import {languageDescriptions} from "../globals.tsx";
import {Language} from "../managers/localization.tsx";
import {useNavigate} from "react-router-dom";

export default function SelectLanguage() {
    const settingsManager = useContext(SettingsManagerContext);
    const navigate = useNavigate();
    return (<List>
        {Object.entries(languageDescriptions).map(([key, language], index) => <div key={key}>
            {index === 0 || <Divider/>}
            <ListItemButton onClick={() => {
                settingsManager?.setLanguage(key as Language);
                navigate(-1);
            }}>
                <ListItemIcon>
                    <Radio
                        checked={settingsManager?.selectedLanguage === key}
                        value={key}
                        disableRipple
                        name="languages"
                        inputProps={{ 'aria-label': key }}
                    />
                </ListItemIcon>
                <ListItemText primary={language.native} secondary={language.default} />
            </ListItemButton>
        </div>)}
    </List>);
}
