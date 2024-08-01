import {Box, ButtonBase, Stack, Typography, useTheme} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import {useNavigate} from "react-router-dom";
import {useL10n} from "../hooks/useL10n.ts";
export default function NewAccountButton() {
    const navigate = useNavigate();
    const theme = useTheme();
    const l10n = useL10n();
    return <ButtonBase component="div" sx={{display: 'block', borderRadius: "6px"}} onClick={() => { navigate('/new'); }}>
        <Box sx={{bgcolor: "background.paper", padding: theme.spacing(1), borderRadius: "6px"}}>
            <Stack alignItems="center" spacing={1} justifyContent="space-between">
                <AddIcon sx={{color: "primary.main"}} fontSize="large" />
                <Stack justifyContent="center" sx={{width: '100%', height: '2em'}}>
                    <Typography
                        align="center"
                        variant="subtitle2"
                        color="text.primary"
                        sx={{lineHeight: '1em'}}
                    >
                        {l10n("ActionAddNewAccount")}
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    </ButtonBase>;
}
