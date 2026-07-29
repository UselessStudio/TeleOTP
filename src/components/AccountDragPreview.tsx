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
            <Grid
                container
                spacing={1}
                sx={{
                    width: "100vw",
                }}
            >
                <Grid sx={wobbleAnimation} size={3}>
                    <AccountSelectButton {...item} />
                </Grid>
            </Grid>
        </div>
    );
};

export default AccountDragPreview;
