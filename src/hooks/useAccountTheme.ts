import { useTheme } from "@mui/material/styles";
import { Theme, alpha, createTheme } from "@mui/material";

export default function useAccountTheme(
    color: string | undefined
): Theme | null {
    const theme = useTheme();

    if (!color) return null;

    const colorMain = alpha(color, .9);

    return createTheme(theme, {
        palette: {
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
