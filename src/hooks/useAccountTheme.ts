import { useTheme } from "@mui/material/styles";
import {Theme, createTheme} from "@mui/material";
import normalizeCustomColor from "../icons/normalizeCustomColor.ts";

/**
 * Creates a Material UI theme for the provided account color.
 * @param {?string} color - account primary color
 */
export default function useAccountTheme(
    color: string | undefined
): Theme | null {
    const theme = useTheme();

    if (!color) return null;

    color = normalizeCustomColor(color, theme);

    return createTheme(theme, {
        palette: {
            primary: theme.palette.augmentColor({
                color: {
                    main: color,
                },
            })
            // primary: {
            //     main: colorMain,
            //     light: alpha(color, 0.5),
            //     dark: alpha(color, 0.9),
            //     contrastText:
            //         getContrastRatio(colorMain, "#fff") > 4.5 ? "#fff" : "#111",
            // },
        },
    } as Theme);
}
