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
import {
    type FC,
    lazy,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
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
    showAdjacentCodes: boolean;
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
    showAdjacentCodes,
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
    const phaseRef = useRef<TransitionPhase>(phase);
    phaseRef.current = phase;
    const lastCodeSet = useRef(`${previousCode}:${code}:${nextCode}`);
    const lastAccountId = useRef(accountId);
    const pendingAccountReset = useRef(false);
    const cleanupFrame = useRef<number | null>(null);
    const codeResizeObserver = useRef<ResizeObserver | null>(null);
    const [currentCodeWidth, setCurrentCodeWidth] = useState(136);
    const observeCurrentCode = useCallback(
        (element: HTMLSpanElement | null) => {
            codeResizeObserver.current?.disconnect();
            if (!element) return;
            const updateWidth = () => {
                if (phaseRef.current !== "idle") return;
                setCurrentCodeWidth(element.getBoundingClientRect().width);
            };
            updateWidth();
            codeResizeObserver.current = new ResizeObserver(updateWidth);
            codeResizeObserver.current.observe(element);
        },
        [],
    );

    useEffect(() => {
        const codeSet = `${previousCode}:${code}:${nextCode}`;
        if (!showAdjacentCodes) {
            lastCodeSet.current = codeSet;
            setDisplayedCodes([previousCode, code, nextCode]);
            setPhase("idle");
            return;
        }
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
    }, [accountId, code, nextCode, previousCode, showAdjacentCodes]);

    useEffect(() => {
        if (phase !== "prepared") return;
        const frame = requestAnimationFrame(() => setPhase("sliding"));
        return () => cancelAnimationFrame(frame);
    }, [phase]);

    useEffect(
        () => () => {
            if (cleanupFrame.current !== null)
                cancelAnimationFrame(cleanupFrame.current);
            codeResizeObserver.current?.disconnect();
        },
        [],
    );

    if (!showAdjacentCodes) {
        return (
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    alignItems: "center",
                    height: { xs: "3.5rem", sm: "4rem" },
                    justifyContent: "center",
                    width: "100%",
                }}
            >
                <Typography
                    sx={{
                        fontSize: {
                            xs: "clamp(2rem, 10vw, 2.5rem)",
                            sm: "3rem",
                        },
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap",
                    }}
                >
                    {formatCode(code)}
                </Typography>
                <IconButton color="primary" onClick={onCopy}>
                    <ContentCopyIcon fontSize="large" />
                </IconButton>
            </Stack>
        );
    }

    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                position: "relative",
                height: { xs: "3.5rem", sm: "4rem" },
            }}
        >
            <Box
                sx={{
                    height: "100%",
                    position: "relative",
                    width: "100%",
                    contain: "layout paint",
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
                    const isLeftCode =
                        phase === "sliding" ? index <= 1 : index === 0;
                    const position =
                        phase === "sliding"
                            ? [
                                  {
                                      left: "-22%",
                                      top: "0%",
                                      width: "22%",
                                      height: "100%",
                                  },
                                  {
                                      left: "0%",
                                      top: "0%",
                                      width: "22%",
                                      height: "100%",
                                  },
                                  {
                                      left: "22%",
                                      top: "0%",
                                      width: "56%",
                                      height: "100%",
                                  },
                                  {
                                      left: "78%",
                                      top: "0%",
                                      width: "22%",
                                      height: "100%",
                                  },
                              ][index]
                            : [
                                  {
                                      left: "0%",
                                      top: "0%",
                                      width: "22%",
                                      height: "100%",
                                  },
                                  {
                                      left: "22%",
                                      top: "0%",
                                      width: "56%",
                                      height: "100%",
                                  },
                                  {
                                      left: "78%",
                                      top: "0%",
                                      width: "22%",
                                      height: "100%",
                                  },
                                  {
                                      left: "100%",
                                      top: "0%",
                                      width: "22%",
                                      height: "100%",
                                  },
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
                                backfaceVisibility: "hidden",
                                color: isCurrent
                                    ? "text.primary"
                                    : "text.secondary",
                                display: "flex",
                                contain: "layout paint style",
                                fontSize: isCurrent
                                    ? {
                                          xs: "clamp(2rem, 10vw, 2.5rem)",
                                          sm: "3rem",
                                      }
                                    : {
                                          xs: "clamp(0.8rem, 3.6vw, 1rem)",
                                          sm: "1.125rem",
                                      },
                                fontVariantNumeric: "tabular-nums",
                                height: position?.height,
                                justifyContent: {
                                    xs: isCurrent
                                        ? "center"
                                        : isLeftCode
                                          ? "flex-start"
                                          : "flex-end",
                                    sm: "center",
                                },
                                left: position?.left,
                                opacity,
                                overflow: "visible",
                                position: "absolute",
                                textAlign: "center",
                                top: position?.top,
                                transform: isCurrent
                                    ? "translate3d(-24px, 0, 0)"
                                    : "translate3d(0, 0, 0)",
                                whiteSpace: "nowrap",
                                width: position?.width,
                                willChange:
                                    phase === "sliding"
                                        ? "left, top, width, height, transform, font-size, opacity"
                                        : "auto",
                                transition:
                                    phase === "sliding"
                                        ? "left 320ms cubic-bezier(0.22, 1, 0.36, 1), top 320ms cubic-bezier(0.22, 1, 0.36, 1), width 320ms cubic-bezier(0.22, 1, 0.36, 1), height 320ms cubic-bezier(0.22, 1, 0.36, 1), transform 320ms cubic-bezier(0.22, 1, 0.36, 1), font-size 320ms cubic-bezier(0.22, 1, 0.36, 1), color 240ms ease, opacity 240ms ease"
                                        : "none",
                            }}
                        >
                            <span
                                ref={isCurrent ? observeCurrentCode : undefined}
                            >
                                {formatCode(displayedCode)}
                            </span>
                        </Typography>
                    );
                })}
            </Box>
            <IconButton
                color="primary"
                onClick={onCopy}
                sx={{
                    left: `calc(50% - 24px + ${currentCodeWidth / 2 + 8}px)`,
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
                                showAdjacentCodes={
                                    settingsManager?.showAdjacentCodes ?? true
                                }
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
