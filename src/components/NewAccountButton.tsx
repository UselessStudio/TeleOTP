import {ButtonBase, Paper, Stack, Typography, useTheme} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import {useNavigate} from "react-router-dom";
export default function NewAccountButton() {
    const navigate = useNavigate();
    const theme = useTheme();
    return <ButtonBase component="div" sx={{display: 'block'}} onClick={() => { navigate('/new'); }}>
        <Paper sx={{padding: theme.spacing(1)}}>
            <Stack alignItems="center" spacing={1} justifyContent="space-between">
                <AddIcon sx={{color: "primary.main"}} fontSize="large" />
                <Stack justifyContent="center" sx={{width: '100%', height: '3em'}}>
                    <Typography
                        align="center"
                        variant="subtitle2"
                        color="text.primary"
                        sx={{lineHeight: '1em'}}
                    >
                        Add new account
                    </Typography>
                </Stack>
            </Stack>
        </Paper>
    </ButtonBase>;
}