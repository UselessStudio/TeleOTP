import {Box, ButtonBase, Stack, Typography, useTheme} from "@mui/material";
import {FC} from "react";
import {SvgIconComponent} from "@mui/icons-material";
import {Color} from "../globals.tsx";
interface AccountSelectButtonProps {
    selected?: boolean,
    label: string,
    issuer?: string,
    icon: SvgIconComponent,
    color: Color,
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
    const theme = useTheme();
    const Icon = icon;
    return <ButtonBase component="div" sx={{display: 'block', borderRadius: "6px"}} onClick={onClick}>
        <Box sx={{bgcolor: selected ? `${color}.main` : "background.paper", padding: theme.spacing(1), borderRadius: "6px"}}>
            <Stack alignItems="center" spacing={1} justifyContent="space-between">
                <Icon sx={{color: selected ? `${color}.contrastText` : `${color}.main`}} fontSize="large" />
                <Stack justifyContent="center" sx={{width: '100%', height: '2em'}}>
                    <Typography
                        align="center"
                        noWrap
                        sx={{lineHeight: '1.2em', verticalAlign: 'center'}}
                        variant="subtitle2"
                        fontWeight={selected ? "bold" : "lighter"}
                        color={selected ? `${color}.contrastText` : "text.primary"}
                    >
                        {issuer ? issuer : label}
                    </Typography>

                    {issuer ? <Typography
                        align="center"
                        noWrap
                        sx={{lineHeight: '1.2em', verticalAlign: 'center'}}
                        variant="subtitle2"
                        fontWeight={selected ? "bold" : "lighter"}
                        color={selected ? `${color}.contrastText` : "text.primary"}
                    >
                        ({label})
                    </Typography> : null}
                </Stack>
            </Stack>
        </Box>
    </ButtonBase>;
}

export default AccountSelectButton;