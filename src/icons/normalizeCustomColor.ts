import {darken, getLuminance, lighten} from "@mui/material";

/**
 * Adjust color to be visible on the theme background.
 * @param color - the color to be normalized
 * @param mode - current theme mode
 */
export default function normalizeCustomColor(color: string, mode: "dark" | "light") {
    if (getLuminance(color) < 0.2 && mode !== "light") {
        color = lighten(color, 0.5);
    } else if(getLuminance(color) > 0.8 && mode !== "dark") {
        color = darken(color, 0.5);
    }
    return color;
}
