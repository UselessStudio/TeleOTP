import type { SvgIconComponent } from "@mui/icons-material";
import { ButtonBase, Stack, Typography, useTheme } from "@mui/material";
import type { FC } from "react";

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
    center = false,
}) => {
    const theme = useTheme();
    const Icon = icon;
    return (
        <ButtonBase
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
            <Stack
                direction="row"
                spacing={1.5}
                sx={{
                    alignItems: "center",
                    justifyContent: center ? "center" : "start",
                    width: "100%",
                }}
            >
                <Icon color="primary" />
                <Typography
                    color="text"
                    align="left"
                    sx={{
                        fontWeight: "medium",
                        fontSize: "small",
                        flexGrow: center ? 0 : 1,
                    }}
                >
                    {text}
                </Typography>
                <Typography
                    color="primary"
                    sx={{
                        fontWeight: "800",
                        fontSize: "small",
                    }}
                >
                    {value}
                </Typography>
            </Stack>
        </ButtonBase>
    );
};
