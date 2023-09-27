import {FC, useEffect, useState} from "react";
import {
    Button,
    Card,
    CardContent,
    LinearProgress,
    List,
    ListItemButton,
    ListItemText, ListSubheader,
    Stack,
    Typography,
    CardActions, ListItemIcon, Paper, Divider
} from "@mui/material";
import * as copy from "copy-to-clipboard";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from "@mui/icons-material/Settings";
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import {useNavigate} from "react-router-dom";
import useAccount from "../hooks/useAccount.ts";

const Accounts: FC = () => {
    const navigate = useNavigate();
    // TODO: add storage and encryption
    const {code, period} = useAccount("otpauth://totp/TeleOTP?secret=JBSWY3DPEHPK3PXP&algorithm=SHA1&digits=6&period=30");

    const [time, setTime] = useState(0);
    useEffect(() => {
        const timer = setInterval(()=>{
            setTime((Date.now() / 1000) % 30);
        }, 300);

        return () => {
            clearInterval(timer);
        };
    });

    return <>
        <Stack spacing={2}>
            <Card sx={{width: "100%"}}>
                <LinearProgress variant="determinate" value={time/period*100} />
                <CardContent>
                    <Typography variant="subtitle1" align="center">
                        Your github account code:
                    </Typography>
                    <Stack direction="row" justifyContent="center" alignItems="center">
                        <Typography variant="h3">
                            {code.match(/.{1,3}/g)?.join(" ")}
                        </Typography>
                        <Button onClick={() => {
                            copy(code);
                        }}>
                            <ContentCopyIcon/>
                        </Button>
                    </Stack>
                </CardContent>
                <CardActions>
                    <Button color="error" onClick={() => {
                        window.Telegram.WebApp.showPopup({
                            message: "Are you sure you want to remove your Github account forever? You might get locked out of this account!",
                            buttons: [
                                {type: "destructive", text: "Yes", id: "remove"},
                                {type: "cancel", id: "cancel"},
                            ]
                        }, (id) => {
                            console.log("delete", id);
                        });
                    }}>Delete account</Button>
                </CardActions>
            </Card>

            <Paper>
                <List aria-labelledby="subheader" subheader={<ListSubheader id="subheader">Your accounts</ListSubheader>}>
                    <ListItemButton>
                        <ListItemText>GitHub (LowderPlay)</ListItemText>
                    </ListItemButton>
                    <Divider />
                    <ListItemButton onClick={() => { navigate("settings"); }}>
                        <ListItemIcon><SettingsIcon/></ListItemIcon>
                        <ListItemText>Open settings</ListItemText>
                    </ListItemButton>
                </List>
            </Paper>
        </Stack>
        <Fab color="primary" aria-label="add" sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
        }} onClick={() => { navigate("/new"); }}>
            <AddIcon />
        </Fab>
    </>;
}

export default Accounts;