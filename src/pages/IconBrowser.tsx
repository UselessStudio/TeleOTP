import { FC, useEffect, useMemo, useState } from "react";
import {
    CircularProgress,
    Link,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
} from "@mui/material";
import LottieAnimation from "../components/LottieAnimation.tsx";
import TelegramTextField from "../components/TelegramTextField.tsx";
import MagnificationGlass from "../assets/magnification_glass.json";
import { useLocation, useNavigate } from "react-router-dom";
import { ICONS_DATA_URL } from "../globals.tsx";
import SVG from "react-inlinesvg";
import Fuse from "fuse.js/min-basic";
import { useDebounce } from "use-debounce";
import { EditAccountState } from "./EditAccount.tsx";
import { iconUrl, titleToIconSlug } from "../icons/iconUtils.ts";

interface IconsData {
    icons: {
        title: string;
        hex: string;
        source: string;
        aliases?: {
            aka?: string[];
            loc?: Record<string, string>;
            old?: string[];
            dup?: {
                title: string;
                hex?: string;
                source?: string;
                loc?: Record<string, string>;
            }[];
        };
        guidelines?: string;
        license?: {
            type: string;
            url?: string;
        };
        slug?: string;
    }[];
}

const IconsList: FC<Pick<IconsData, "icons"> & { searchQuery: string }> = ({
    icons,
    searchQuery,
}) => {
    // function titleToIconSlug(title: string): string {
    //     return title
    //         .toLowerCase()
    //         .replace(/[ \\/-]/gi, "")
    //         .replace(/\./gi, "dot");
    // }
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as EditAccountState;
    const fuse = useMemo(
        () =>
            new Fuse(icons, {
                keys: ["title", "slug", "aliases.aka", "aliases.old", "aliases.loc", "aliases.dup"],
                shouldSort: true,
            }),
        [icons]
    );
    const filtered = fuse.search(searchQuery, { limit: 10 });

    return (
        <List sx={{ width: "100%" }}>
            {filtered.map(({ item }) => (
                <ListItemButton
                    key={item.title}
                    onClick={() => {
                        navigate("/edit", {
                            state: {
                                account: {
                                    ...state.account,
                                    ...{
                                        icon:
                                            item.slug ??
                                            titleToIconSlug(item.title),
                                        color: `#${item.hex}`,
                                    },
                                },
                            },
                        });
                    }}
                >
                    <ListItemIcon sx={{ padding: "8px" }}>
                        <SVG
                            cacheRequests={false}
                            loader={<CircularProgress color="primary" />}
                            src={iconUrl(item.slug ?? titleToIconSlug(item.title))}
                            fill={"#" + item.hex}
                        ></SVG>
                    </ListItemIcon>
                    <ListItemText primary={item.title}></ListItemText>
                </ListItemButton>
            ))}
        </List>
    );
};

const IconBrowser: FC = () => {
    const [phrase, setPhrase] = useState("");
    const [query] = useDebounce(phrase, 1000);
    const [verified, setVerified] = useState(true);
    const [searching, setSearching] = useState(false);
    const [iconsData, setIconsData] = useState<IconsData | undefined>();
    useEffect(() => {
        void caches.open("teleotp").then(async (cache) => {
            const cachedData = await cache.match(ICONS_DATA_URL);
            if (cachedData?.ok) {
                setIconsData(await cachedData.json());
            } else {
                await cache.add(ICONS_DATA_URL);
                const _cachedData = await cache.match(ICONS_DATA_URL);
                if (_cachedData?.ok) setIconsData(await _cachedData.json());
                else {
                    window.Telegram.WebApp.showAlert(
                        "Error when fetching icons data, please retry later"
                    );
                }
            }
        });
    }, []);

    useEffect(() => {
        if (verified && phrase.length > 2) {
            setSearching(true);
        } else {
            setSearching(false);
        }
    }, [phrase]);

    // const navigate = useNavigate();
    // useTelegramMainButton(
    //     () => {
    //         if (!verified) return false;
    //         storageManager?.clearStorage();
    //         navigate("/");
    //         return true;
    //     },
    //     "Remove PERMANENTLY",
    //     !iconSelected
    // );

    return (
        <>
            <Stack spacing={2} alignItems="center">
                <Typography variant="h5" fontWeight="bold" align="center">
                    Browse icons
                </Typography>
                <TelegramTextField
                    fullWidth
                    autoComplete="false"
                    autoFocus={true}
                    type="search"
                    label="Pattern to search"
                    value={phrase}
                    error={!verified}
                    helperText={!verified ? "Enter al least two symbols" : null}
                    onChange={(e) => {
                        const value = e.target.value;
                        setPhrase(value);
                        setVerified(value.trim().length >= 2);
                    }}
                />
                {!searching && (
                    <>
                        <Typography
                            // fontFamily={"monospace"}
                            color="text.secondary"
                            align="center"
                            variant="subtitle1"
                            fontWeight={400}
                        >
                            Start typing to search
                        </Typography>
                        <LottieAnimation
                            speed={1}
                            loop={searching}
                            animationData={MagnificationGlass}
                        />
                    </>
                )}
                {/* {searching && (
                    <Typography
                        // fontFamily={"monospace"}
                        sx={{
                            ":after": {
                                content: '"..."',
                            },
                            width: "fit-content",
                            fontWeight: "semi-bold",
                            fontSize: 16,
                            clipPath: "inset(0 12px 0 0)",
                            animation: "dots-loading 1s steps(4) infinite",
                            userSelect: "none",
                        }}
                        align="center"
                        variant="h6"
                        fontWeight={400}
                    >
                        Searching
                    </Typography>
                )} */}
                {searching && iconsData && (
                    <IconsList icons={iconsData.icons} searchQuery={query} />
                )}
                <Typography justifySelf={"flex-end"} variant="subtitle2">
                    Icons provided by{" "}
                    <Link rel="noopener" target="_blank" variant="subtitle2" color="text.secondary" href="https://github.com/simple-icons/simple-icons">
                        @simpleicons
                    </Link>
                </Typography>
            </Stack>
        </>
    );
};

export default IconBrowser;
