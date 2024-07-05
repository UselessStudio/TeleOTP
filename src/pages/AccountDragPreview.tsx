import {FC, PropsWithChildren} from "react";
import {usePreview} from "react-dnd-preview";
import AccountSelectButton, {AccountSelectButtonProps} from "../components/AccountSelectButton.tsx";
import {Grid} from "@mui/material";

const AccountDragPreview: FC<PropsWithChildren> = () => {
    const preview = usePreview<AccountSelectButtonProps>();
    if (!preview.display) {
        return <></>;
    }
    const {item, style} = preview;

    return <div className="item-list__item" style={style}>
        <Grid container spacing={1} width={"100vw"}>
            <Grid item xs={3}>
                <AccountSelectButton {...item}/>
            </Grid>
        </Grid>
    </div>
}

export default AccountDragPreview;
