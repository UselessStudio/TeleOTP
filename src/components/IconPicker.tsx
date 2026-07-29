import CircleIcon from "@mui/icons-material/Circle";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import SearchIcon from "@mui/icons-material/Search";
import {
    alpha,
    CircularProgress,
    Grid,
    IconButton,
    Stack,
    SvgIcon,
    type SxProps,
    type Theme,
    Typography,
    useTheme,
} from "@mui/material";
import { type ColorResult, hexToHsva } from "@uiw/color-convert";
import { type FC, useEffect, useState } from "react";
import SVG from "react-inlinesvg";
import { useLocation, useNavigate } from "react-router-dom";
import { colors, type Icon, icons } from "../globals.tsx";
import { useL10n } from "../hooks/useL10n.ts";
import { iconUrl } from "../icons/icons.ts";
import normalizeCustomColor from "../icons/normalizeCustomColor.ts";
import type { NewAccountState } from "../pages/CreateAccount.tsx";
import type { EditAccountState } from "../pages/EditAccount.tsx";
import ColorPicker from "./ColorPicker.tsx";

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
        outlineStyle: "solid",
        outlineWidth: 1,
        outlineColor: alpha(color, 0.3),
        bgcolor: isSelected ? color : alpha(color, 0.15),
    };
}

const IconPicker: FC<IconPickerProps> = ({
    selectedIcon,
    setSelectedIcon,
    selectedColor,
    setSelectedColor,
}) => {
    const theme = useTheme();
    const [mainColor, setMainColor] = useState<string>("#fff");
    const location = useLocation();
    const state = location.state as NewAccountState | EditAccountState;
    const navigate = useNavigate();
    const l10n = useL10n();
    const [pickerColor, setPickerColor] = useState<ColorResult>();

    useEffect(() => {
        if (pickerColor) setSelectedColor(pickerColor.hex);
    }, [pickerColor, setSelectedColor]);

    useEffect(() => {
        setMainColor(alpha(selectedColor, 0.7));
    }, [selectedColor]);

    const isCustom = !Object.keys(icons).includes(selectedIcon);
    selectedColor = normalizeCustomColor(selectedColor, theme);

    return (
        <Stack sx={{ width: "100%" }} spacing={1}>
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    justifyContent: "center",
                    width: "100%",
                }}
            >
                {colors.map((color: string) => {
                    return (
                        <IconButton
                            key={color}
                            sx={{ color: color }}
                            onClick={() => {
                                setSelectedColor(color);
                            }}
                        >
                            {selectedColor === color ? (
                                <RadioButtonCheckedIcon />
                            ) : (
                                <CircleIcon />
                            )}
                        </IconButton>
                    );
                })}
                <ColorPicker
                    selected={!colors.includes(selectedColor)}
                    color={pickerColor?.hsva ?? hexToHsva(selectedColor)}
                    onChange={(color) => {
                        setPickerColor(color);
                    }}
                />
            </Stack>
            <Stack
                direction="column"
                spacing={1}
                sx={{
                    justifyContent: "center",
                    justifyItems: "center",
                    width: "100%",
                }}
            >
                <Grid
                    container
                    direction="row"
                    spacing={0.3}
                    sx={{
                        justifyContent: "center",
                        flexWrap: "wrap",
                    }}
                >
                    {Object.entries(icons).map(([key, Icon]) => {
                        return (
                            <Grid key={key}>
                                <IconButton
                                    disableRipple={true}
                                    sx={buttonStyle(
                                        selectedIcon === key,
                                        mainColor,
                                    )}
                                    onClick={() => {
                                        setSelectedIcon(key);
                                    }}
                                >
                                    <Icon
                                        sx={{
                                            color:
                                                selectedIcon === key
                                                    ? theme.palette.getContrastText(
                                                          selectedColor,
                                                      )
                                                    : alpha(selectedColor, 0.7),
                                        }}
                                    />
                                </IconButton>
                            </Grid>
                        );
                    })}
                    <Grid>
                        <IconButton
                            disableRipple={true}
                            sx={buttonStyle(isCustom, mainColor)}
                            onClick={() => {
                                navigate("/icons", { state });
                            }}
                        >
                            <Stack
                                direction="row"
                                sx={{
                                    gap: 1,
                                    paddingX: 0.5,
                                }}
                            >
                                {isCustom ? (
                                    <SvgIcon
                                        sx={{
                                            fill: theme.palette.getContrastText(
                                                selectedColor,
                                            ),
                                        }}
                                        component="center"
                                    >
                                        <SVG
                                            // only for dev purposes
                                            title={
                                                import.meta.env.DEV
                                                    ? selectedIcon
                                                    : ""
                                            }
                                            cacheRequests={true}
                                            loader={
                                                <CircularProgress color="primary" />
                                            }
                                            src={iconUrl(selectedIcon)}
                                        ></SVG>
                                    </SvgIcon>
                                ) : (
                                    <SearchIcon
                                        sx={{
                                            color: alpha(selectedColor, 0.7),
                                        }}
                                    />
                                )}
                                <Typography
                                    color={
                                        isCustom
                                            ? theme.palette.getContrastText(
                                                  selectedColor,
                                              )
                                            : alpha(selectedColor, 0.7)
                                    }
                                >
                                    {isCustom
                                        ? l10n("ActionChangeMenu")
                                        : l10n("ActionMoreMenu")}
                                </Typography>
                            </Stack>
                        </IconButton>
                    </Grid>
                </Grid>
            </Stack>
        </Stack>
    );
};

export default IconPicker;
