import {FC, useEffect, useState} from "react";
import {
    alpha,
    Grid,
    IconButton,
    Stack,
    useTheme,
    SvgIcon,
    CircularProgress,
    Typography, SxProps, Theme
} from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import {Icon, colors, icons} from "../globals.tsx";
import ColorPicker from "./ColorPicker.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { NewAccountState } from "../pages/CreateAccount.tsx";
import{ type ColorResult, hexToHsva } from "@uiw/color-convert";
import { EditAccountState } from "../pages/EditAccount.tsx";
import SVG from 'react-inlinesvg';
import { iconUrl } from "../icons/icons.ts";
import SearchIcon from "@mui/icons-material/Search";
import normalizeCustomColor from "../icons/normalizeCustomColor.ts";
import {useL10n} from "../hooks/useL10n.ts";

interface IconPickerProps {
    selectedIcon: Icon;
    setSelectedIcon(icon: Icon): void;
    selectedColor: string;
    setSelectedColor(color: string): void;
}

function buttonStyle(isSelected: boolean, color: string): SxProps<Theme> {
    return {
        margin: 0.5,
            padding: 1,
        borderRadius: 100,
        outlineStyle: 'solid',
        outlineWidth: 1,
        outlineColor: alpha(color, 0.3),
        bgcolor: isSelected ? color: alpha(color, 0.15),
    }
}

const IconPicker: FC<IconPickerProps> = ({ selectedIcon, setSelectedIcon, selectedColor, setSelectedColor }) => {
    const theme = useTheme();
    const [mainColor, setMainColor] = useState<string>('#fff');
    const location = useLocation();
    const state = location.state as NewAccountState | EditAccountState;
    const navigate = useNavigate();
    const l10n = useL10n();
    const [pickerColor, setPickerColor] = useState<ColorResult>();
    
    useEffect(() => {
        if (pickerColor)
            setSelectedColor(pickerColor.hex);
    }, [pickerColor])

    useEffect(() => {
        setMainColor(alpha(selectedColor, 0.7))
    }, [selectedColor])

    const isCustom = !Object.keys(icons).includes(selectedIcon);
    selectedColor = normalizeCustomColor(selectedColor, theme);

    return <Stack sx={{width: '100%'}} spacing={1}>
        <Stack direction="row" justifyContent="center" sx={{width: '100%'}} spacing={1}>
            {colors.map((color: string) => {
                return  <IconButton
                        key={color}
                        sx={{ color: color }}
                        onClick={() => { setSelectedColor(color); }}
                    >
                        {selectedColor === color ? <RadioButtonCheckedIcon/> : <CircleIcon/>}
                    </IconButton>
                
            })}
            <ColorPicker selected={!colors.includes(selectedColor)}
                         color={pickerColor?.hsva ?? hexToHsva(selectedColor)}
                         onChange={color => {setPickerColor(color)}} />
        </Stack>
        <Stack direction="column" justifyContent="center" justifyItems="center" sx={{width: '100%'}} spacing={1}>
            <Grid container direction="row" justifyContent="center" flexWrap="wrap" spacing={.3}>
                {Object.entries(icons).map(([key, Icon]) => {
                    return <Grid key={key} item>
                        <IconButton disableRipple={true}
                            sx={buttonStyle(selectedIcon == key, mainColor)}
                            onClick={() => { setSelectedIcon(key); }}>
                        <Icon sx={{color: selectedIcon == key ? theme.palette.getContrastText(selectedColor) : alpha(selectedColor, 0.7)}}/>
                        </IconButton>
                    </Grid>;
                })}
                <Grid item>
                    <IconButton
                        disableRipple={true}
                        sx={buttonStyle(isCustom, mainColor)}
                        onClick={() => {navigate('/icons', { state })}}
                    >
                        <Stack direction="row" gap={1} paddingX={0.5}>
                            {isCustom ? <SvgIcon sx={{fill: theme.palette.getContrastText(selectedColor) }} component="center">
                                <SVG
                                    // only for dev purposes
                                    title={import.meta.env.DEV ? selectedIcon : ""}
                                    cacheRequests={true}
                                    loader={<CircularProgress color="primary" />}
                                    src={iconUrl(selectedIcon)}>
                                </SVG>
                            </SvgIcon> : <SearchIcon sx={{color: alpha(selectedColor, 0.7)}}/>}
                            <Typography color={isCustom ? theme.palette.getContrastText(selectedColor) : alpha(selectedColor, 0.7)}>
                                {isCustom ? l10n("ActionChangeMenu") : l10n("ActionMoreMenu")}
                            </Typography>
                        </Stack>
                    </IconButton>
                </Grid>
            </Grid>
        </Stack>
    </Stack>;
};

export default IconPicker;
