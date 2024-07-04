import {FC, useContext, useEffect, useState} from "react";
import {
    Button,
    LinearProgress,
    Stack,
    Typography,
    IconButton, Container, Grid, useTheme, Box, ThemeProvider
} from "@mui/material";
import copy from 'copy-text-to-clipboard';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from "@mui/icons-material/Settings";
import {useNavigate} from "react-router-dom";
import useAccount from "../hooks/useAccount.ts";
import EditIcon from '@mui/icons-material/Edit';
import AccountSelectButton from "../components/AccountSelectButton.tsx";
import NewAccountButton from "../components/NewAccountButton.tsx";
import {StorageManagerContext} from "../managers/storage/storage.tsx";
import NewAccount from "./NewAccount.tsx";
import {EditAccountState} from "./EditAccount.tsx";
import useTelegramHaptics from "../hooks/telegram/useTelegramHaptics.ts";
import {SettingsManagerContext} from "../managers/settings.tsx";
import useAccountTheme from "../hooks/useAccountTheme.ts";

const Accounts: FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { selectionChanged, } = useTelegramHaptics();

    const storageManager = useContext(StorageManagerContext);
    const settingsManager = useContext(SettingsManagerContext);

    const [
        selectedAccountId,
        setSelectedAccountId
    ] = useState<string | null>(null);
    // const [accountTheme, setAccountTheme] = useState<any>();

    useEffect(() => {
        if(!storageManager?.accounts || Object.keys(storageManager.accounts).length < 1) return;
        if(selectedAccountId !== null && selectedAccountId in storageManager.accounts) return;
        const accounts = Object.keys(storageManager.accounts);
        const account = settingsManager?.lastSelectedAccount ?? accounts[accounts.length - 1];
        setSelectedAccountId(accounts.includes(account) ? account : accounts[accounts.length - 1]);

    }, [selectedAccountId, storageManager?.accounts, settingsManager?.lastSelectedAccount]);

    const selectedAccount = selectedAccountId && storageManager ? storageManager.accounts[selectedAccountId] : null;
       
    const accountTheme = useAccountTheme(selectedAccount?.color) ?? theme

    const {code, progress} = useAccount(selectedAccount?.uri);

    if (storageManager === null || Object.keys(storageManager.accounts).length < 1) {
        return <NewAccount/>;
    }

    return <Stack justifyContent="space-between" sx={{flex: 1}} spacing={2}>
        <ThemeProvider theme={accountTheme}>
            <Stack spacing={2}>
                <Container sx={{bgcolor: "background.paper", borderRadius: "6px", paddingY: theme.spacing(2)}}>
                    <Stack spacing={1} direction="row" justifyContent="center" alignItems="center">
                        <Typography variant="body2">
                            {selectedAccount?.issuer ?
                                `${selectedAccount.issuer} (${selectedAccount.label})` :
                                selectedAccount?.label}
                        </Typography>
                        <IconButton onClick={() => {
                            navigate('/edit', {state: {
                                account: selectedAccount
                            } as EditAccountState});
                        }}>
                            <EditIcon/>
                        </IconButton>
                    </Stack>

                    
                    <Stack spacing={1} direction="row" justifyContent="center" alignItems="center">
                        <Typography variant="h3">
                            {code.match(/.{1,3}/g)?.join(" ")}
                        </Typography>
                        <IconButton color={"primary"} onClick={() => {
                            copy(code);
                        }}>
                            <ContentCopyIcon fontSize="large"/>
                        </IconButton>
                    </Stack>
                    <LinearProgress
                        sx={{marginY: theme.spacing(1), borderRadius: 100, height: 6}}
                        variant="determinate"
                        value={progress*100}
                        color={"primary"}
                    />
                </Container>

                <Container disableGutters>
                    <Grid container spacing={1}>
                        {Object.values(storageManager.accounts).sort((a,b) => a.order - b.order).map((account) => (
                            <Grid key={account.id} item xs={3}>
                                <AccountSelectButton
                                    icon={account.icon}
                                    label={account.label}
                                    issuer={account.issuer}
                                    selected={account.id === selectedAccountId}
                                    onClick={() => {
                                        settingsManager?.setLastSelectedAccount(account.id);
                                        setSelectedAccountId(account.id);
                                        selectionChanged();
                                    }}
                                    color={account.color}/>
                            </Grid>
                        ))}
                        <ThemeProvider theme={theme}>
                            <Grid item xs={3}>
                                <NewAccountButton/>
                            </Grid>
                        </ThemeProvider>
                    </Grid>
                </Container>
            </Stack>
        </ThemeProvider>

        <Box sx={{bgcolor: "background.paper", borderRadius: "6px"}}>
            <Button
                fullWidth
                startIcon={<SettingsIcon />}
                variant="text"
                sx={{textTransform: 'none', paddingY: theme.spacing(1.5)}}
                onClick={() => { navigate("/settings"); }}
            >
                <Typography fontWeight="bold" color="text" fontSize="small">Open settings</Typography>
            </Button>
        </Box>

    </Stack>;
}

export default Accounts;
