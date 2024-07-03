import {FC, useEffect, useState} from "react";
import {alpha, Grid, IconButton, Stack, useTheme, Divider, Button, SvgIcon, CircularProgress} from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import {Icon, colors, icons} from "../globals.tsx";
import ColorPicker from "./ColorPicker.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { NewAccountState } from "../pages/CreateAccount.tsx";
import{ type ColorResult, hexToHsva } from "@uiw/color-convert";
import { EditAccountState } from "../pages/EditAccount.tsx";
import SVG from 'react-inlinesvg';
import { iconUrl } from "../icons/iconUtils.ts";

interface IconPickerProps {
    selectedIcon: Icon;
    setSelectedIcon(icon: Icon): void;
    selectedColor: string;
    setSelectedColor(color: string): void;
}

const IconPicker: FC<IconPickerProps> = ({ selectedIcon, setSelectedIcon, selectedColor, setSelectedColor }) => {
    const theme = useTheme();
    // const colors = ["#1c98e6", "#2e7d32", "#ed6c02", "#9c27b0", "#d32f2f", "#0288d1"];
    const [mainColor, setMainColor] = useState<string>('#fff');
    const location = useLocation();
    const state = location.state as NewAccountState | EditAccountState;
    const navigate = useNavigate();
    const [pickerColor, setPickerColor] = useState<ColorResult>();
    
    useEffect(() => {
        if (pickerColor)
            setSelectedColor(pickerColor.hex);
    }, [pickerColor])

    useEffect(() => {
        setMainColor(alpha(selectedColor, 0.7))
    }, [selectedColor])

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
            {/* @ts-ignore */}
            <ColorPicker selected={!colors.includes(selectedColor)} color={pickerColor?.hsva ?? hexToHsva(selectedColor)} onChange={color => {setPickerColor(color)}} />
        </Stack>
        <Stack direction="column" justifyContent="center" justifyItems="center" sx={{width: '100%'}} spacing={1}>
            <Grid container direction="row" justifyContent="center" flexWrap="wrap" spacing={.3}>
                {Object.entries(icons).map(([key, Icon]) => {
                    return <Grid key={key} item>
                        <IconButton
                            sx={{
                                margin: 0.5,
                                padding: 1,
                                borderRadius: 100,
                                outlineStyle: 'solid',
                                outlineWidth: 1,
                                outlineColor: selectedIcon === key ? mainColor : theme.palette.divider,
                                bgcolor: selectedIcon === key ? alpha(mainColor, 0.15) : undefined,
                            }}
                            onClick={() => { setSelectedIcon(key ); }}>
                        <Icon sx={{color: alpha(selectedColor, 0.7)}}/>
                        </IconButton>
                    </Grid>;
                })}
            </Grid>
            <Divider variant="middle" sx={{userSelect: 'none', color: 'text.secondary'}} flexItem>OR</Divider>
            <Button 
                variant="outlined" 
                size="medium" 
                sx={{
                    maxWidth: '70%',
                    placeSelf:'center'
                }}
                onClick={() => {navigate('/icons', { state })}}
            >
                {!Object.keys(icons).includes((state as EditAccountState).account.icon)
                    ? <Stack direction={"column"} alignItems={"center"}>
                        <SvgIcon sx={{height: 35, width:35, fill: mainColor }} component="center">
                            <SVG
                                // only for dev purposes
                                title={import.meta.env.DEV ? (state as EditAccountState).account.icon : ""}
                                cacheRequests={true}
                                loader={<CircularProgress color="primary" />}
                                src={iconUrl((state as EditAccountState).account.icon)}>
                            </SVG>
                        </SvgIcon>
                        Change icon
                    </Stack>
                    : <>
                        Browse custom icons
                    </>
                }
            </Button>
        </Stack>
    </Stack>;
};

export default IconPicker;
