import {Box, ButtonBase, Stack, Typography, useTheme} from "@mui/material";
import {FC} from "react";
import {SvgIconComponent} from "@mui/icons-material";
interface AccountSelectButtonProps {
    selected?: boolean,
    label: string,
    issuer?: string,
    icon: SvgIconComponent,
    onClick: () => void,
}

const AccountSelectButton: FC<AccountSelectButtonProps> = (
    {
        selected = false,
        icon,
        label,
        issuer,
        onClick,
}) => {
    const theme = useTheme();
    const Icon = icon;
    return <ButtonBase component="div" sx={{display: 'block', borderRadius: "6px"}} onClick={onClick}>
        <Box sx={{bgcolor: selected ? "primary.main" : "background.paper", padding: theme.spacing(1), borderRadius: "6px"}}>
            <Stack alignItems="center" spacing={1} justifyContent="space-between">
                <Icon sx={{color: selected ? "primary.contrastText" : "text.primary"}} fontSize="large" />
                <Stack justifyContent="center" sx={{width: '100%', height: '2em'}}>
                    <Typography
                        align="center"
                        sx={{lineClamp: 2, overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1em', verticalAlign: 'center'}}
                        variant="subtitle2"
                        fontWeight="lighter"
                        color={selected ? "primary.contrastText" : "text.primary"}
                    >
                        {issuer ? `${issuer} (${label})` : label}
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    </ButtonBase>;
}

export default AccountSelectButton;