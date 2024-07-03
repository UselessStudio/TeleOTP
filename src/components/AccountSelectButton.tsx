import { Box, ButtonBase, CircularProgress, Stack, SvgIcon, Typography } from "@mui/material";
import { FC } from "react";
import { icons } from "../globals";
import SVG from 'react-inlinesvg';
import useAccountTheme from "../hooks/useAccountTheme";
import { iconUrl } from "../icons/iconUtils";
interface AccountSelectButtonProps {
    selected?: boolean,
    label: string,
    issuer?: string,
    icon: string,
    color: string,
    onClick: () => void,
}

const AccountSelectButton: FC<AccountSelectButtonProps> = (
    {
        selected = false,
        icon,
        label,
        issuer,
        onClick,
        color,
}) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const theme = useAccountTheme(color)!;

    return <ButtonBase component="div" sx={{display: 'block', borderRadius: "6px"}} onClick={onClick}>
        <Box sx={{bgcolor: selected ? theme.palette.primary.main : theme.palette.background.paper , padding: theme.spacing(1), borderRadius: "6px"}}>
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
