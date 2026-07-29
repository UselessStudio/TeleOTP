import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import {
    Box,
    Container,
    Grid,
    IconButton,
    LinearProgress,
    Stack,
    ThemeProvider,
    Typography,
    useTheme,
} from "@mui/material";
import copy from "copy-text-to-clipboard";
import { type FC, lazy, useContext, useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd-multi-backend";
import { Flipped, Flipper } from "react-flip-toolkit";
import { useNavigate } from "react-router-dom";
import AccountDragPreview from "../components/AccountDragPreview.tsx";
import AccountSelectButton from "../components/AccountSelectButton.tsx";
import { FlatButton } from "../components/FlatButton.tsx";
import NewAccountButton from "../components/NewAccountButton.tsx";
import { HTML5toTouch } from "../drag.ts";
import useTelegramHaptics from "../hooks/telegram/useTelegramHaptics.ts";
import useAccount from "../hooks/useAccount.ts";
import useAccountTheme from "../hooks/useAccountTheme.ts";
import { useL10n } from "../hooks/useL10n.ts";
import { SettingsManagerContext } from "../managers/settings.tsx";
import {
    type Account,
    StorageManagerContext,
} from "../managers/storage/storage.tsx";
import type { EditAccountState } from "./EditAccount.tsx";

const NewAccount = lazy(() => import("./NewAccount.tsx"));
const NewUpdateDialog = lazy(() => import("../components/NewUpdateDialog.tsx"));

interface OtpCodeCarouselProps {
    accountId: string | null;
    previousCode: string;
    code: string;
    nextCode: string;
    onCopy: () => void;
}

type TransitionPhase = "idle" | "prepared" | "sliding";

function formatCode(code: string): string {
    return code.match(/.{1,3}/g)?.join(" ") ?? code;
}

const OtpCodeCarousel: FC<OtpCodeCarouselProps> = ({
    accountId,
    previousCode,
    code,
    nextCode,
    onCopy,
}) => {
    const [displayedCodes, setDisplayedCodes] = useState([
        previousCode,
        code,
        nextCode,
    ]);
    const [phase, setPhase] = useState<TransitionPhase>("idle");
    const lastCodeSet = useRef(`${previousCode}:${code}:${nextCode}`);
    const lastAccountId = useRef(accountId);
    const pendingAccountReset = useRef(false);
    const cleanupFrame = useRef<number | null>(null);

    useEffect(() => {
        const codeSet = `${previousCode}:${code}:${nextCode}`;
        if (accountId !== lastAccountId.current) {
            lastAccountId.current = accountId;
            lastCodeSet.current = codeSet;
            pendingAccountReset.current = true;
            setDisplayedCodes([previousCode, code, nextCode]);
            setPhase("idle");
            return;
        }

        if (codeSet === lastCodeSet.current) return;

        if (
            pendingAccountReset.current ||
            lastCodeSet.current.includes("N/A")
        ) {
            pendingAccountReset.current = false;
            setDisplayedCodes([previousCode, code, nextCode]);
        } else {
            setDisplayedCodes((current) => [...current.slice(0, 3), nextCode]);
            setPhase("prepared");
        }
        lastCodeSet.current = codeSet;
    }, [accountId, code, nextCode, previousCode]);

    useEffect(() => {
        if (phase !== "prepared") return;
        const frame = requestAnimationFrame(() => setPhase("sliding"));
        return () => cancelAnimationFrame(frame);
    }, [phase]);

    useEffect(
        () => () => {
            if (cleanupFrame.current !== null)
                cancelAnimationFrame(cleanupFrame.current);
        },
        [],
    );

    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                position: "relative",
                height: "clamp(3.5rem, 12vw, 4rem)",
            }}
        >
            <Box
                sx={{
                    height: "100%",
                    position: "relative",
                    width: "100%",
                }}
            >
                {displayedCodes.map((displayedCode, index) => {
                    const isCurrent =
                        (phase !== "sliding" && index === 1) ||
                        (phase === "sliding" && index === 2);
                    const opacity =
                        (phase === "sliding" && index === 0) ||
                        (phase === "prepared" && index === 3)
                            ? 0
                            : isCurrent
                              ? 1
                              : 0.55;
                    const position =
                        phase === "sliding"
                            ? [
                                  { left: "-25%", width: "25%" },
                                  { left: "0%", width: "25%" },
                                  { left: "25%", width: "50%" },
                                  { left: "75%", width: "25%" },
                              ][index]
                            : [
                                  { left: "0%", width: "25%" },
                                  { left: "25%", width: "50%" },
                                  { left: "75%", width: "25%" },
                                  { left: "100%", width: "25%" },
                              ][index];

                    return (
                        <Typography
                            // biome-ignore lint/suspicious/noArrayIndexKey: The index identifies a stable animation slot, not the code value.
                            key={`${index}-${displayedCode}`}
                            onTransitionEnd={(event) => {
                                if (
                                    index !== 2 ||
                                    event.propertyName !== "left" ||
                                    phase !== "sliding"
                                )
                                    return;
                                cleanupFrame.current = requestAnimationFrame(
                                    () => {
                                        setDisplayedCodes([
                                            previousCode,
                                            code,
                                            nextCode,
                                        ]);
                                        setPhase("idle");
                                        cleanupFrame.current = null;
                                    },
                                );
                            }}
                            sx={{
                                alignItems: "center",
                                color: isCurrent
                                    ? "text.primary"
                                    : "text.secondary",
                                display: "flex",
                                fontSize: isCurrent
                                    ? "clamp(1.75rem, 9vw, 3rem)"
                                    : "clamp(0.65rem, 2.8vw, 1rem)",
                                height: "100%",
                                justifyContent: "center",
                                left: position?.left,
                                opacity,
                                overflow: "visible",
                                position: "absolute",
                                textAlign: "center",
                                transform: isCurrent
                                    ? "translateX(-24px)"
                                    : "translateX(0)",
                                whiteSpace: "nowrap",
                                width: position?.width,
                                transition:
                                    phase === "sliding"
                                        ? "left 400ms cubic-bezier(0.4, 0, 0.2, 1), width 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1), font-size 400ms cubic-bezier(0.4, 0, 0.2, 1), color 400ms ease, opacity 400ms ease"
                                        : "none",
                            }}
                        >
                            {formatCode(displayedCode)}
                        </Typography>
                    );
                })}
            </Box>
            <IconButton
                color="primary"
                onClick={onCopy}
                sx={{
                    left: "calc(50% + min(18vw, 80px) - 24px)",
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1,
                }}
            >
                <ContentCopyIcon fontSize="large" />
            </IconButton>
        </Box>
    );
};

const Accounts: FC = () => {
    const navigate = useNavigate();
    const l10n = useL10n();
    const theme = useTheme();
    const { selectionChanged } = useTelegramHaptics();

    const storageManager = useContext(StorageManagerContext);
    const settingsManager = useContext(SettingsManagerContext);

    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
        settingsManager?.lastSelectedAccount ?? null,
    );
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(
        null,
    );

    useEffect(() => {
        if (!storageManager?.accounts || storageManager.accounts.length < 1)
            return;
        if (
            selectedAccountId !== null &&
            storageManager.accounts.find((acc) => acc.id === selectedAccountId)
        )
            return;
        const accounts = storageManager.accounts;
        setSelectedAccountId(accounts[accounts.length - 1].id);
    }, [selectedAccountId, storageManager?.accounts]);

    useEffect(() => {
        setSelectedAccount(
            storageManager?.accounts.find(
                (acc) => acc.id === selectedAccountId,
            ) ?? null,
        );
    }, [selectedAccountId, storageManager?.accounts]);

    const accountTheme = useAccountTheme(selectedAccount?.color) ?? theme;

    const { code, previousCode, nextCode, progress } = useAccount(
        selectedAccount?.uri,
    );
    const [animating, setAnimating] = useState<Record<string, boolean>>({});

    if (
        storageManager === null ||
        Object.keys(storageManager.accounts).length < 1
    ) {
        return <NewAccount />;
    }

    return (
        <Stack
            spacing={2}
            sx={{
                justifyContent: "space-between",
                flex: 1,
            }}
        >
            <ThemeProvider theme={accountTheme}>
                <Stack spacing={2}>
                    <Container
                        sx={{
                            bgcolor: "background.paper",
                            borderRadius: "6px",
                            paddingY: theme.spacing(2),
                        }}
                    >
                        <Stack
                            spacing={1}
                            direction="row"
                            sx={{
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Typography variant="body2">
                                {selectedAccount?.issuer
                                    ? `${selectedAccount.issuer} (${selectedAccount.label})`
                                    : selectedAccount?.label}
                            </Typography>
                            <IconButton
                                onClick={() => {
                                    navigate("/edit", {
                                        state: {
                                            account: selectedAccount,
                                        } as EditAccountState,
                                    });
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                        </Stack>

                        <Stack
                            direction="row"
                            sx={{
                                alignItems: "center",
                                width: "100%",
                            }}
                        >
                            <OtpCodeCarousel
                                accountId={selectedAccountId}
                                previousCode={previousCode}
                                code={code}
                                nextCode={nextCode}
                                onCopy={() => copy(code)}
                            />
                        </Stack>
                        <LinearProgress
                            sx={{
                                marginY: theme.spacing(1),
                                borderRadius: 100,
                                height: 6,
                            }}
                            variant="determinate"
                            value={progress * 100}
                            color={"primary"}
                        />
                    </Container>

                    <Container disableGutters>
                        <DndProvider options={HTML5toTouch}>
                            <Flipper
                                flipKey={storageManager.accounts
                                    .map((a) => a.id)
                                    .join("")}
                            >
                                <Grid container spacing={1}>
                                    {storageManager.accounts.map(
                                        (account, index) => (
                                            <Flipped
                                                key={account.id}
                                                flipId={account.id}
                                                onStartImmediate={() => {
                                                    setAnimating((anim) => ({
                                                        ...anim,
                                                        [account.id]: true,
                                                    }));
                                                }}
                                                onComplete={() => {
                                                    setAnimating((anim) => ({
                                                        ...anim,
                                                        [account.id]: false,
                                                    }));
                                                }}
                                            >
                                                <Grid key={account.id} size={3}>
                                                    <AccountSelectButton
                                                        index={index}
                                                        animating={
                                                            animating[
                                                                account.id
                                                            ] ?? false
                                                        }
                                                        id={account.id}
                                                        icon={account.icon}
                                                        label={account.label}
                                                        issuer={account.issuer}
                                                        selected={
                                                            account.id ===
                                                            selectedAccountId
                                                        }
                                                        onClick={() => {
                                                            settingsManager?.setLastSelectedAccount(
                                                                account.id,
                                                            );
                                                            setSelectedAccountId(
                                                                account.id,
                                                            );
                                                            selectionChanged();
                                                        }}
                                                        color={account.color}
                                                    />
                                                </Grid>
                                            </Flipped>
                                        ),
                                    )}
                                    <ThemeProvider theme={theme}>
                                        <Grid size={3}>
                                            <NewAccountButton />
                                        </Grid>
                                    </ThemeProvider>
                                </Grid>
                            </Flipper>
                            <AccountDragPreview />
                        </DndProvider>
                    </Container>
                </Stack>
            </ThemeProvider>
            <NewUpdateDialog />
            <FlatButton
                onClick={() => {
                    navigate("/settings");
                }}
                text={l10n("ActionOpenSettings")}
                icon={SettingsIcon}
                center={true}
            />
        </Stack>
    );
};

export default Accounts;
