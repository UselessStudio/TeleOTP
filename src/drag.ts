import {HTML5Backend} from "react-dnd-html5-backend";
import {MouseTransition, MultiBackendOptions, TouchTransition} from "react-dnd-multi-backend";
import {TouchBackend} from "react-dnd-touch-backend";
import {SxProps, Theme} from "@mui/material";

export const wobbleAnimation: SxProps<Theme> = {
    "@keyframes rotate": {
        "0%": {
            transform: "rotate(-5deg)",
            animationTimingFunction: "ease-in",
        },
        "50%": {
            transform: "rotate(5deg)",
            animationTimingFunction: "ease-out",
        },
    },
    transformOrigin: "50% 10%",
    animation: "rotate 0.5s ease infinite",
    animationDirection: "alternate",
};

export const HTML5toTouch: MultiBackendOptions = {
    backends: [
        {
            id: 'html5',
            backend: HTML5Backend,
            transition: MouseTransition,
        },
        {
            id: 'touch',
            backend: TouchBackend,
            options: {
                enableMouseEvents: false
            },
            preview: true,
            transition: TouchTransition,
        },
    ],
}

export enum DragTypes {
    AccountCard = "card",
}
