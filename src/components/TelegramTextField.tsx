import {styled, TextField, TextFieldProps} from "@mui/material";

const TelegramTextField = styled((props: TextFieldProps) => (
    <TextField
        {...props}
        variant="standard"
        onFocus={(e) => {
            e.target.scrollIntoView({behavior: "smooth"});
        }}
    />
))(({ theme }) => ({
    'label': {
        color: theme.palette.text.secondary,
        fontSize: "0.9em",
        lineHeight: "1em",
    },
    'label.MuiInputLabel-shrink': {
        fontSize: "1em",
    },
    '& .MuiInput-root': {
        '--TextField-brandBorderColor': theme.palette.divider,
        '&:not(.Mui-disabled, .Mui-error):before': {
            borderBottom: '1px solid var(--TextField-brandBorderColor)',
        },
        '&:hover:not(.Mui-disabled, .Mui-error):before': {
            borderBottom: '1px solid var(--TextField-brandBorderColor)',
        },
    },
}));

export default TelegramTextField;