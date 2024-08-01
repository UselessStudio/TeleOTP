import {FC, lazy, useContext, useEffect, useState} from "react";
import {
    LinearProgress,
    Stack,
    Typography,
    IconButton,
    Container,
    Grid,
    useTheme,
    ThemeProvider,
} from "@mui/material";
import copy from 'copy-text-to-clipboard';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from "@mui/icons-material/Settings";
import {useNavigate} from "react-router-dom";
import useAccount from "../hooks/useAccount.ts";
import EditIcon from '@mui/icons-material/Edit';
import AccountSelectButton from "../components/AccountSelectButton.tsx";
import NewAccountButton from "../components/NewAccountButton.tsx";
import {Account, StorageManagerContext} from "../managers/storage/storage.tsx";
import {EditAccountState} from "./EditAccount.tsx";
import useTelegramHaptics from "../hooks/telegram/useTelegramHaptics.ts";
import {SettingsManagerContext} from "../managers/settings.tsx";
import useAccountTheme from "../hooks/useAccountTheme.ts";
import { DndProvider } from "react-dnd-multi-backend";
import AccountDragPreview from "../components/AccountDragPreview.tsx";
import {Flipped, Flipper} from "react-flip-toolkit";
import {HTML5toTouch} from "../drag.ts";
import {FlatButton} from "../components/FlatButton.tsx";
import {useL10n} from "../hooks/useL10n.ts";

const NewAccount = lazy(() => import("./NewAccount.tsx"));
const NewUpdateDialog = lazy(() => import("../components/NewUpdateDialog.tsx"));

const Accounts: FC = () => {
    const navigate = useNavigate();
    const l10n = useL10n();
    const theme = useTheme();
    const { selectionChanged, } = useTelegramHaptics();

    const storageManager = useContext(StorageManagerContext);
    const settingsManager = useContext(SettingsManagerContext);

    const [
        selectedAccountId,
        setSelectedAccountId
    ] = useState<string | null>(settingsManager?.lastSelectedAccount ?? null);
    const [
        selectedAccount,
        setSelectedAccount
    ] = useState<Account | null>(null);

    useEffect(() => {
        if(!storageManager?.accounts || storageManager.accounts.length < 1) return;
        if(selectedAccountId !== null &&
            storageManager.accounts.find(acc => acc.id === selectedAccountId)) return;
        const accounts = storageManager.accounts;
        setSelectedAccountId(accounts[accounts.length - 1].id);
    }, [selectedAccountId, storageManager?.accounts, settingsManager?.lastSelectedAccount]);

    useEffect(() => {
        setSelectedAccount(storageManager?.accounts.find(acc => acc.id === selectedAccountId) ?? null);
    }, [selectedAccountId, storageManager?.accounts]);
       
    const accountTheme = useAccountTheme(selectedAccount?.color) ?? theme

    const {code, progress} = useAccount(selectedAccount?.uri);
    const [
        animating,
        setAnimating
    ] = useState<Record<string, boolean>>({});

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
                    <DndProvider options={HTML5toTouch}>
                        <Flipper flipKey={storageManager.accounts.map(a => a.id).join("")}>
                            <Grid container spacing={1}>
                                {storageManager.accounts.map((account, index) => (
                                    <Flipped key={account.id} flipId={account.id}
                                             onStartImmediate={() => {
                                                 setAnimating(anim => ({...anim, [account.id]: true}))
                                             }}
                                             onComplete={() => {
                                                 setAnimating(anim => ({...anim, [account.id]: false}))
                                             }}>
                                        <Grid key={account.id} item xs={3}>
                                            <AccountSelectButton
                                                index={index}
                                                animating={animating[account.id] ?? false}
                                                id={account.id}
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
                                    </Flipped>
                                ))}
                                <ThemeProvider theme={theme}>
                                    <Grid item xs={3}>
                                        <NewAccountButton/>
                                    </Grid>
                                </ThemeProvider>
                            </Grid>
                        </Flipper>
                        <AccountDragPreview/>
                    </DndProvider>
                </Container>
            </Stack>
        </ThemeProvider>
        <NewUpdateDialog/>
        <FlatButton onClick={() => { navigate("/settings"); }} text={l10n("ActionOpenSettings")}
                    icon={SettingsIcon} center={true}/>
    </Stack>;
}

export default Accounts;
