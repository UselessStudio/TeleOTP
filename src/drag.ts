import {HTML5Backend} from "react-dnd-html5-backend";
import {MouseTransition, MultiBackendOptions, TouchTransition} from "react-dnd-multi-backend";
import {TouchBackend} from "react-dnd-touch-backend";

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
