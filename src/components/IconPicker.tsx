import {FC, useState} from "react";
import {
    alpha,
    Grid,
    IconButton,
    Stack,
    useTheme
} from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import PaidIcon from '@mui/icons-material/Paid';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StoreIcon from '@mui/icons-material/Store';
import InstagramIcon from '@mui/icons-material/Instagram';
import RedditIcon from '@mui/icons-material/Reddit';
import PinterestIcon from '@mui/icons-material/Pinterest';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CommentIcon from '@mui/icons-material/Comment';
import EmailIcon from '@mui/icons-material/Email';

const icons = {
    "github": GitHubIcon,
    "google": GoogleIcon,
    "facebook": FacebookIcon,
    "twitter": TwitterIcon,
    "instagram": InstagramIcon,
    "reddit": RedditIcon,
    "pinterest": PinterestIcon,
    "linkedin": LinkedInIcon,
    "paid": PaidIcon,
    "wallet": AccountBalanceWalletIcon,
    "store": StoreIcon,
    "comment": CommentIcon,
    "email": EmailIcon,
}

const colors = [
    "primary", "success", "warning", "secondary", "error", "info",
] as const;

type Colors = typeof colors;
type Color = Colors[number];

const IconPicker: FC = () => {
    const theme = useTheme();
    const [selectedIcon, setSelectedIcon] = useState("github");
    const [selectedColor, setSelectedColor] = useState<Color>(colors[0]);

    return <Stack sx={{width: '100%'}} spacing={1}>
        <Stack direction="row" justifyContent="center" sx={{width: '100%'}} spacing={1}>
            {colors.map((color: Color) => {
                return <IconButton
                    key={color}
                    color={color}
                    onClick={() => { setSelectedColor(color); }}
                >
                    {selectedColor === color ? <RadioButtonCheckedIcon/> : <CircleIcon/>}
                </IconButton>;
            })}
        </Stack>
        <Grid container direction="row" justifyContent="center" flexWrap="wrap">
            {Object.entries(icons).map(([key, Icon]) => {
                return <Grid key={key} item>
                    <IconButton
                        sx={{
                            margin: 0.5,
                            padding: 1,
                            borderRadius: 100,
                            border: 1,
                            borderColor: selectedIcon === key ? theme.palette[selectedColor].main : theme.palette.divider,
                            bgcolor: selectedIcon === key ? alpha(theme.palette[selectedColor].main, 0.15) : undefined,
                        }}
                        onClick={() => { setSelectedIcon(key); }}>
                        <Icon sx={{color: selectedIcon === key ? theme.palette[selectedColor].main : alpha(theme.palette.text.primary, 0.8)}}/>
                    </IconButton>
                </Grid>;
            })}
        </Grid>
    </Stack>;
};

export default IconPicker;