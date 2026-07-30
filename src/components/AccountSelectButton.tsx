import {
    Box,
    ButtonBase,
    CircularProgress,
    Stack,
    SvgIcon,
    type SxProps,
    type Theme,
    type TouchRippleActions,
    Typography,
} from "@mui/material";
import { type FC, useContext, useEffect, useRef, useState } from "react";
import { type DragSourceMonitor, useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import SVG from "react-inlinesvg";
import { DragTypes, wobbleAnimation } from "../drag.ts";
import { icons } from "../globals";
import useTelegramHaptics from "../hooks/telegram/useTelegramHaptics.ts";
import useAccountTheme from "../hooks/useAccountTheme";
import { iconUrl } from "../icons/icons.ts";
import { StorageManagerContext } from "../managers/storage/storage.tsx";

export interface AccountSelectButtonProps {
    id: string;
    index: number;
    selected?: boolean;
    label: string;
    issuer?: string;
    icon: string;
    color: string;
    animating: boolean;
    onClick: () => void;
}

function createIconStyle(theme: Theme, selected: boolean): SxProps<Theme> {
    return {
        height: 35,
        width: 35,
        color: selected
            ? theme.palette.primary.contrastText
            : theme.palette.primary.main,
    };
}

const AccountSelectButton: FC<AccountSelectButtonProps> = (props) => {
    const {
        id,
        animating,
        index,
        selected = false,
        icon,
        label,
        issuer,
        onClick,
        color,
    } = props;
    // biome-ignore lint/style/noNonNullAssertion: Account colors are required and always produce a theme.
    const theme = useAccountTheme(color)!;
    const storageManager = useContext(StorageManagerContext);
    const { impactOccurred } = useTelegramHaptics();

    const rippleRef = useRef<TouchRippleActions>(null);

    const [isHolding, setHolding] = useState<boolean>(false);
    const [isTouching, setTouching] = useState<boolean>(false);

    useEffect(() => {
        if (isTouching) {
            const timeout = setTimeout(() => {
                setHolding(true);
                rippleRef.current?.stop();
                impactOccurred("heavy");
            }, 300);

            return () => {
                clearTimeout(timeout);
            };
        } else {
            setHolding(false);
            rippleRef.current?.stop();
        }
    }, [impactOccurred, isTouching]);

    const [{ isDragging }, drag, preview] = useDrag({
        type: DragTypes.AccountCard,
        item: props,
        canDrag: window.matchMedia("(pointer: fine)").matches || isHolding,
        collect: (monitor: DragSourceMonitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: () => {
            storageManager?.saveAccounts(storageManager.accounts);
            setHolding(false);
            setTouching(false);
            rippleRef.current?.stop();
        },
    });

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    const [, drop] = useDrop({
        accept: DragTypes.AccountCard,
        drop: () => ({ id }),
        hover: (draggedItem: AccountSelectButtonProps | null) => {
            if (draggedItem && !animating) {
                storageManager?.reorder(draggedItem.id, index);
            }
        },
    });
    const ref = useRef(null);
    drag(drop(ref));

    return (
        <ButtonBase
            component="div"
            sx={{
                display: "block",
                borderRadius: "6px",
                opacity: isDragging ? 0 : 1,
                ...(isHolding ? wobbleAnimation : {}),
            }}
            touchRippleRef={rippleRef}
            onClick={onClick}
            onTouchMove={() => {
                if (!isHolding) {
                    setTouching(false);
                    rippleRef.current?.stop();
                }
            }}
            onPointerDown={rippleRef.current?.start}
            onPointerUp={rippleRef.current?.stop}
            onTouchCancel={() => {
                setTouching(false);
            }}
            onTouchEnd={() => {
                setTouching(false);
            }}
            onTouchStart={() => {
                setTouching(true);
            }}
        >
            <Box
                sx={{
                    bgcolor: selected
                        ? theme.palette.primary.main
                        : theme.palette.background.paper,
                    padding: theme.spacing(1),
                    borderRadius: "6px",
                }}
                ref={ref}
            >
                <Stack
                    spacing={1}
                    sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    {Object.keys(icons).includes(icon) ? (
                        // shorthand for const Icon = icons[icon]; <Icon />;
                        ((Icon) => (
                            <Icon sx={createIconStyle(theme, selected)} />
                        ))(icons[icon])
                    ) : (
                        <SvgIcon
                            sx={createIconStyle(theme, selected)}
                            component="center"
                        >
                            <SVG
                                // only for dev purposes
                                title={import.meta.env.DEV ? icon : ""}
                                cacheRequests={true}
                                loader={<CircularProgress color="primary" />}
                                src={iconUrl(icon)}
                            ></SVG>
                        </SvgIcon>
                    )}
                    <Stack
                        sx={{
                            justifyContent: "center",
                            width: "100%",
                            height: "2em",
                        }}
                    >
                        <Typography
                            align="center"
                            noWrap
                            variant="subtitle2"
                            sx={{
                                color: selected
                                    ? theme.palette.primary.contrastText
                                    : theme.palette.text.primary,
                                fontWeight: selected ? "bold" : "lighter",
                                lineHeight: "1.2em",
                                verticalAlign: "center",
                            }}
                        >
                            {issuer ? issuer : label}
                        </Typography>

                        {issuer ? (
                            <Typography
                                align="center"
                                noWrap
                                variant="subtitle2"
                                sx={{
                                    color: selected
                                        ? theme.palette.primary.contrastText
                                        : theme.palette.text.primary,
                                    fontWeight: selected ? "bold" : "lighter",
                                    lineHeight: "1.2em",
                                    verticalAlign: "center",
                                }}
                            >
                                ({label})
                            </Typography>
                        ) : null}
                    </Stack>
                </Stack>
            </Box>
        </ButtonBase>
    );
};

export default AccountSelectButton;
