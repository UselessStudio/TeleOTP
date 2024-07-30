import { useTheme } from "@mui/material/styles";
import {Theme, alpha, createTheme, getLuminance} from "@mui/material";

/**
 * Creates a Material UI theme for the provided account color.
 * @param {?string} color - account primary color
 */
export default function useAccountTheme(
    color: string | undefined
): Theme | null {
    const theme = useTheme();

    if (!color) return null;

    const colorMain = alpha(color, .9);

    let mode = theme.palette.mode;
    if (getLuminance(color) < 0.1) {
        mode = "light";
    } else if(getLuminance(color) > 0.9) {
        mode = "dark";
    }

    return createTheme(theme, {
        palette: {
            mode,
            primary: theme.palette.augmentColor({
                color: {
                    main: colorMain,
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
