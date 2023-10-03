import {FC} from "react";
import {alpha, Grid, IconButton, Stack, useTheme} from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import {Color, colors, Icon, icons} from "../globals.tsx";

interface IconPickerProps {
    selectedIcon: Icon;
    setSelectedIcon(icon: Icon): void;
    selectedColor: Color;
    setSelectedColor(color: Color): void;
}

const IconPicker: FC<IconPickerProps> = ({selectedIcon, setSelectedIcon, selectedColor, setSelectedColor}) => {
    const theme = useTheme();

    return <Stack sx={{width: '100%'}} spacing={1}>
        <Stack direction="row" justifyContent="center" sx={{width: '100%'}} spacing={1}>
            {colors.map((color: Color) => {
                return <IconButton
                    key={color}
                    color={color}
                    onClick={() => { setSelectedColor(color); }}
                >
                    {selectedColor === color ? <RadioButtonCheckedIcon/> : <CircleIcon/>}
                </IconButton>;
            })}
        </Stack>
        <Grid container direction="row" justifyContent="center" flexWrap="wrap">
            {Object.entries(icons).map(([key, Icon]) => {
                return <Grid key={key} item>
                    <IconButton
                        sx={{
                            margin: 0.5,
                            padding: 1,
                            borderRadius: 100,
                            border: 1,
                            borderColor: selectedIcon === key ? theme.palette[selectedColor].main : theme.palette.divider,
                            bgcolor: selectedIcon === key ? alpha(theme.palette[selectedColor].main, 0.15) : undefined,
                        }}
                        onClick={() => { setSelectedIcon(key ); }}>
                        <Icon sx={{color: selectedIcon === key ? theme.palette[selectedColor].main : alpha(theme.palette.text.primary, 0.8)}}/>
                    </IconButton>
                </Grid>;
            })}
        </Grid>
    </Stack>;
};

export default IconPicker;