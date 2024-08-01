import {useContext} from "react";
import {SettingsManagerContext} from "../managers/settings.tsx";
import {Divider, List, ListItemButton, ListItemIcon, ListItemText, Radio, Stack} from "@mui/material";
import {languageDescriptions} from "../globals.tsx";
import {Language} from "../managers/localization.tsx";
import {useNavigate} from "react-router-dom";
import {FlatButton} from "../components/FlatButton.tsx";
import {useL10n} from "../hooks/useL10n.ts";
import TranslateIcon from '@mui/icons-material/Translate';

export default function SelectLanguage() {
    const settingsManager = useContext(SettingsManagerContext);
    const navigate = useNavigate();
    const l10n = useL10n();

    return (
        <Stack spacing={1}>
            <List sx={{bgcolor: "background.paper", borderRadius: "6px", padding: 1}}>
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
            </List>
            <FlatButton center={true} onClick={() => {
                window.Telegram.WebApp.openLink(import.meta.env.VITE_TRANSLATE_LINK);
            }} text={l10n("HelpTranslating")} icon={TranslateIcon}/>
        </Stack>);
}
