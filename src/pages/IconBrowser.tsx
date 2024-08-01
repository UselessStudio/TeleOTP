import {FC, useCallback, useEffect, useMemo, useState} from "react";
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
import MagnificationGlass from "../assets/magnification_glass_lottie.json";
import { useLocation, useNavigate } from "react-router-dom";
import SVG from "react-inlinesvg";
import Fuse from "fuse.js/min-basic";
import { useDebounce } from "use-debounce";
import { EditAccountState } from "./EditAccount.tsx";
import {ICONS_DATA_URL, iconUrl, titleToIconSlug} from "../icons/icons.ts";
import {NewAccountState} from "./CreateAccount.tsx";
import normalizeCustomColor from "../icons/normalizeCustomColor.ts";
import {useTheme} from "@mui/material/styles";
import {useL10n} from "../hooks/useL10n.ts";

interface IconData {
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
}

interface IconsData {
    icons: IconData[];
}

const IconsList: FC<Pick<IconsData, "icons"> & { searchQuery: string }> = ({
    icons,
    searchQuery,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isFromEditing = location.state.account !== undefined;
    const state = useCallback((icon: string, color: string): EditAccountState | NewAccountState => {
        if(isFromEditing) {
            const state = location.state as EditAccountState;
            return {
                account: {
                    ...state.account,
                    ...{
                        icon,
                        color,
                    },
                },
            };
        } else {
            const state = location.state as NewAccountState;
            return {
                ...state,
                icon, color
            };
        }
    }, [isFromEditing]);
    const fuse = useMemo(
        () =>
            new Fuse(icons, {
                keys: ["title", "slug", "aliases.aka", "aliases.old", "aliases.loc", "aliases.dup"],
                shouldSort: true,
            }),
        [icons]
    );
    const filtered = fuse.search(searchQuery, { limit: 10 });

    const theme = useTheme();

    return (
        <List sx={{ width: "100%" }}>
            {filtered.map(({ item }) => (
                <ListItemButton
                    key={item.title}
                    onClick={() => {
                        navigate(isFromEditing ? "/edit" : "/create", {
                            state: state(item.slug ?? titleToIconSlug(item.title), `#${item.hex}`),
                        });
                    }}
                >
                    <ListItemIcon sx={{ padding: "8px", marginRight: 2 }}>
                        <SVG
                            cacheRequests={false}
                            loader={<CircularProgress color="primary" />}
                            src={iconUrl(item.slug ?? titleToIconSlug(item.title))}
                            fill={normalizeCustomColor(`#${item.hex}`, theme)}
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
    const l10n = useL10n();

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
                        l10n("IconsFetchError")
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

    return (
        <>
            <Stack spacing={2} alignItems="center">
                <Typography variant="h5" fontWeight="bold" align="center">
                    {l10n("BrowseIconsTitle")}
                </Typography>
                <TelegramTextField
                    fullWidth
                    autoComplete="false"
                    autoFocus={true}
                    type="search"
                    label={l10n("SearchPatternLabel")}
                    value={phrase}
                    error={!verified}
                    helperText={!verified ? l10n("SearchHelper") : null}
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
                            {l10n("StartTyping")}
                        </Typography>
                        <LottieAnimation
                            speed={1}
                            loop={searching}
                            animationData={MagnificationGlass}
                        />
                    </>
                )}
                {searching && iconsData && (
                    <IconsList icons={iconsData.icons} searchQuery={query} />
                )}
                <Typography justifySelf={"flex-end"} variant="subtitle2">
                    {l10n("IconsProvidedBy")}
                    <Link rel="noopener" target="_blank" variant="subtitle2" color="text.secondary" href="https://github.com/simple-icons/simple-icons">
                        @simpleicons
                    </Link>
                </Typography>
            </Stack>
        </>
    );
};

export default IconBrowser;
