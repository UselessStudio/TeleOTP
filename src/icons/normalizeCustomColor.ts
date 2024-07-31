import {darken, getContrastRatio, lighten, Theme} from "@mui/material";

/**
 * Adjust color to be visible on the theme background.
 * @param color - the color to be normalized
 * @param theme - the app's theme
 */
export default function normalizeCustomColor(color: string, theme: Theme) {
    if(getContrastRatio(color, theme.palette.background.paper) >= 2) return color;
    if (theme.palette.mode === "dark") {
        color = lighten(color, 0.4);
    } else {
        color = darken(color, 0.4);
    }
    return color;
}
