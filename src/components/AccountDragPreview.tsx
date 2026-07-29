import { Grid } from "@mui/material";
import type { FC, PropsWithChildren } from "react";
import { usePreview } from "react-dnd-preview";
import { wobbleAnimation } from "../drag.ts";
import AccountSelectButton, {
    type AccountSelectButtonProps,
} from "./AccountSelectButton.tsx";

const AccountDragPreview: FC<PropsWithChildren> = () => {
    const preview = usePreview<AccountSelectButtonProps>();
    if (!preview.display) {
        return null;
    }
    const { item, style } = preview;

    return (
        <div className={"item-list__item"} style={style}>
            <Grid container spacing={1} width={"100vw"}>
                <Grid item xs={3} sx={wobbleAnimation}>
                    <AccountSelectButton {...item} />
                </Grid>
            </Grid>
        </div>
    );
};

export default AccountDragPreview;
