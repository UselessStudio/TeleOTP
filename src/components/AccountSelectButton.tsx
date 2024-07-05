import { Box, ButtonBase, CircularProgress, Stack, SvgIcon, Typography } from "@mui/material";
import {FC, useContext, useEffect, useRef, useState} from "react";
import { icons } from "../globals";
import SVG from 'react-inlinesvg';
import useAccountTheme from "../hooks/useAccountTheme";
import { iconUrl } from "../icons/icons.ts";
import {DragSourceMonitor, useDrag, useDrop} from "react-dnd";
import {DragTypes} from "../drag.ts";
import {getEmptyImage} from "react-dnd-html5-backend";
import {StorageManagerContext} from "../managers/storage/storage.tsx";
import useTelegramHaptics from "../hooks/telegram/useTelegramHaptics.ts";

export interface AccountSelectButtonProps {
    id: string;
    index: number;
    selected?: boolean,
    label: string,
    issuer?: string,
    icon: string,
    color: string,
    animating: boolean,
    onClick: () => void,
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const theme = useAccountTheme(color)!;
    const storageManager = useContext(StorageManagerContext);
    const { impactOccurred } = useTelegramHaptics();

    const [isHolding, setHolding] = useState<boolean>(false);
    const [isTouching, setTouching] = useState<boolean>(false);

    useEffect(() => {
        if(isTouching) {
            const timeout = setTimeout(() => {
                setHolding(true);
                impactOccurred("light");
            }, 300);

            return () => {
                clearTimeout(timeout);
            }
        } else {
            setHolding(false);
        }
    }, [impactOccurred, isTouching]);

    const [{isDragging}, drag, preview] = useDrag({
        type: DragTypes.AccountCard,
        item: props,
        canDrag: isHolding,
        collect: (monitor: DragSourceMonitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: () => {
            storageManager?.saveAccounts(storageManager.accounts);
            setHolding(false);
        },
    });

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true })
    }, [preview]);

    const [, drop] = useDrop({
        accept: DragTypes.AccountCard,
        drop: () => ({id}),
        hover: (draggedItem: AccountSelectButtonProps | null) => {
            if (draggedItem && !animating) {
                storageManager?.reorder(draggedItem.id, index);
            }
        },
    });
    const ref = useRef();
    drag(drop(ref));

    return <ButtonBase component="div" sx={{display: 'block', borderRadius: "6px", opacity: isDragging ? 0: 1}}
                       onClick={onClick}
                       onMouseDown={() => { setHolding(true) }}
                       onMouseUp={() => { setHolding(false) }}
                       onTouchStart={() => { setTouching(true) }}
                       onTouchMove={() => { setTouching(false) }}
                       onTouchEnd={() => { setTouching(false) }}>
        <Box sx={{bgcolor: selected ? theme.palette.primary.main : theme.palette.background.paper,
            padding: theme.spacing(1), borderRadius: "6px"}} ref={ref}>
            <Stack alignItems="center" spacing={1} justifyContent="space-between">
                {
                    Object.keys(icons).includes(icon) 
                    // shorthand for const Icon = icons[icon]; <Icon />;
                    ? ((Icon) => <Icon sx={{ height:35, width:35, color: selected ? theme.palette.primary.contrastText : color }}/>)(icons[icon])
                    : <SvgIcon sx={{height: 35, width:35, color: selected ? theme.palette.primary.contrastText : color }} component="center">
                        <SVG 
                            // only for dev purposes
                            title={import.meta.env.DEV ? icon : ""}
                            cacheRequests={true}
                            loader={<CircularProgress color="primary" />}
                            src={iconUrl(icon)}>
                        </SVG>
                    </SvgIcon>
                }
                <Stack justifyContent="center" sx={{width: '100%', height: '2em'}}>
                    <Typography
                        align="center"
                        noWrap
                        sx={{lineHeight: '1.2em', verticalAlign: 'center'}}
                        variant="subtitle2"
                        fontWeight={selected ? "bold" : "lighter"}
                        color={selected ? theme.palette.primary.contrastText : theme.palette.text.primary}
                    >
                        {issuer ? issuer : label}
                    </Typography>

                    {issuer ? <Typography
                        align="center"
                        noWrap
                        sx={{lineHeight: '1.2em', verticalAlign: 'center'}}
                        variant="subtitle2"
                        fontWeight={selected ? "bold" : "lighter"}
                        color={selected ? theme.palette.primary.contrastText : theme.palette.text.primary}
                    >
                        ({label})
                    </Typography> : null}
                </Stack>
            </Stack>
        </Box>
    </ButtonBase>;
}

export default AccountSelectButton;
