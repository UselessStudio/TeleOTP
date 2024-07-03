import { FC, useState } from "react";
import Colorful from "@uiw/react-color-colorful";
import type { ColorfulProps } from "@uiw/react-color-colorful";
import { IconButton, Popover } from "@mui/material";
import { Palette, PaletteOutlined } from "@mui/icons-material";
import { hsvaToHex, type HsvaColor } from "@uiw/color-convert";

interface ColorPickerProps extends ColorfulProps {
    selected: boolean;
}

const ColorPicker: FC<ColorPickerProps> = (props) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "color-popover" : undefined;

    return (
        <>
            <IconButton
                aria-describedby={id}
                sx={{
                    color: hsvaToHex(props.color as HsvaColor),
                    width: 40,
                    height: 40,
                }}
                onClick={handleClick}
            >
                {props.selected ? (
                    <Palette
                        sx={{
                            outlineStyle: "solid",
                            outlineWidth: 2,
                            fontSize: 26,
                            padding: '1.1px',
                            borderRadius: 9999999,
                            outlineColor: String(props.color),
                        }}
                    />
                ) : (
                    <PaletteOutlined sx={{ fontSize: 26 }} />
                )}
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
            >
                <Colorful
                    style={{
                        touchAction: "none",
                    }}
                    disableAlpha
                    onChange={props.onChange}
                    color={props.color}
                    {...props}
                />
            </Popover>
        </>
    );
};

export default ColorPicker;
