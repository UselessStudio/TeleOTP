import {SvgIconComponent} from "@mui/icons-material";
import {FC} from "react";
import {ButtonBase, Stack, Typography, useTheme} from "@mui/material";

interface ButtonParams {
    onClick(): void;

    text: string;
    value?: string;
    disabled?: boolean;
    icon: SvgIconComponent;
    center?: boolean;
}

export const FlatButton: FC<ButtonParams> = ({
                                                     onClick,
                                                     text,
                                                     icon,
                                                     value,
                                                     disabled = false,
                                                     center = false
                                                 }) => {
    const theme = useTheme();
    const Icon = icon;
    return <ButtonBase
        sx={{
            textTransform: "none",
            paddingY: theme.spacing(1),
            paddingX: theme.spacing(1.5),
            width: "100%",
            bgcolor: "background.paper",
            borderRadius: "6px",
        }}
        disabled={disabled}
        onClick={onClick}
    >
        <Stack direction="row" alignItems="center" sx={{width: "100%"}} spacing={1.5} justifyContent={center ? "center" : "start"}>
            <Icon color="primary"/>
            <Typography
                fontWeight="medium"
                color="text"
                fontSize="small"
                sx={{flexGrow: center ? 0 : 1}}
                align="left"
            >
                {text}
            </Typography>
            <Typography fontWeight="800" color="primary" fontSize="small">
                {value}
            </Typography>
        </Stack>
    </ButtonBase>;
}
