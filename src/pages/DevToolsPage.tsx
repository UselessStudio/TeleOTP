import { ReactNode, useContext, useEffect, useState } from "react";
import { useRouteError } from "react-router-dom";
import { AccountBase, StorageManagerContext } from "../managers/storage/storage";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Button,
    Stack,
} from "@mui/material";
import { ExpandMore, Refresh } from "@mui/icons-material";
import { EncryptedData, EncryptionManagerContext } from "../managers/encryption";
import ErrorIcon from "@mui/icons-material/Error";
import copy from "copy-text-to-clipboard";
import ColorPicker from "../components/ColorPicker";

type CloudStorageKey = string;
type CloudStorageValue = string;

type CloudStorageItems = Record<CloudStorageKey, CloudStorageValue>;

export default function DevErrorPage() {
    function getCloudStorage(): Promise<CloudStorageItems> {
        return new Promise<CloudStorageItems>((resolve, reject) => {
            window.Telegram.WebApp.CloudStorage.getKeys((error, keys) => {
                if (error ?? !keys) {
                    reject(new Error(error ?? undefined));
                    return;
                }
                window.Telegram.WebApp.CloudStorage.getItems(
                    keys,
                    (error, values) => {
                        if (error ?? !values) {
                            reject(new Error(error ?? undefined));
                            return;
                        }
                        console.log(values);
                        resolve(values);
                    }
                );
            });
        });
    }

    const [updater, setUpdater] = useState<number>(0);
    const error = useRouteError() as Error | undefined;
    const [cloud, setCloud] = useState<CloudStorageItems>();
    const [showEncrypted, setShowEncrypted] = useState<boolean>(false);
    const [color, setColor] = useState<string>('#000')
    const encryptionManager = useContext(EncryptionManagerContext);
    const storageManager = useContext(StorageManagerContext);

    useEffect(() => {
        getCloudStorage()
            .then((result) => {
                setCloud(result);
            })
            .catch((err: unknown) => {
                throw err;
            });
    }, [updater]);

    useEffect(() => {
        if (error) console.error(error);
    }, [error]);

    function deleteItem(key: string) {
        window.Telegram.WebApp.CloudStorage.removeItem(key);
        setUpdater((val) => val + 1);
    }
    function promptSetItem(key: string) {
        const value = prompt("Enter new value:");
        if (!value || value.length < 1) return;
        window.Telegram.WebApp.CloudStorage.setItem(
            key,
            value,
            (error, result) => {
                if (error ?? !result) console.error(error);
                else console.log("Successfully set", key, "to", value);
            }
        );
        setUpdater((val) => val + 1);
    }
    function saveSnapshot() {
        window.Telegram.WebApp.CloudStorage.getKeys((error, keys) => {
            if (error ?? !keys) {
                console.error(error);
                return;
            }

            window.Telegram.WebApp.CloudStorage.getItems(
                keys,
                (error, result) => {
                    if (error ?? !result) {
                        console.error(error);
                        return;
                    }
                    const snapshot: object = Object.entries(result)
                        .filter(([key]) => !key.startsWith("snapshot"))
                        .reduce((acc, [_key, val]) => {
                            return Object.assign(acc, { [_key]: val });
                        }, {});

                    const stringified = JSON.stringify(snapshot);
                    copy(stringified);
                    window.Telegram.WebApp.showAlert(
                        `Snapshot (${stringified.length} chars) is copied to clipboard.`
                    );
                }
            );
        });
    }
    function loadSnapshot() {
        const snapshotString = prompt("Enter saved snapshot here:");
        if (!snapshotString || snapshotString.length < 3) return;
        let snapshot: object;
        try {
            snapshot = JSON.parse(snapshotString) as object;
            const entries = Object.entries(snapshot) as [string, string][];
            entries.map(([key, val], i) => {
                window.Telegram.WebApp.CloudStorage.setItem(
                    key,
                    val,
                    (error, result) => {
                        if (error ?? !result) console.error(error);
                    }
                );
                if (i === entries.length - 1) {
                    window.Telegram.WebApp.showAlert(`Loaded snapshot!`);
                    location.reload();
                }
            });
        } catch (e) {
            console.error("error while loading shapshot:", e);
            window.Telegram.WebApp.showAlert(
                `Cannot load snapshot: ${e instanceof Error ? e.message : e}`
            );
        }
    }
    function tryParse(val: string, decrypt: boolean): ReactNode {
        if (!encryptionManager) return "";
        try {
            //@ts-expect-error ensure val is parseable, otherwise func will throw
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _ = JSON.parse(val) as object;
            const account = decrypt ? encryptionManager.decrypt(val) : val;
            if (!account) throw new Error("couldn't decrypt account");
            const accountInfo = JSON.parse(account) as AccountBase | EncryptedData;

            return (
                <>
                    <Accordion sx={{ maxWidth: 250, overflow: "auto" }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            {'iv' in accountInfo
                                ? accountInfo.iv
                                : `(${accountInfo.issuer ? accountInfo.issuer : accountInfo.label}) ${accountInfo.id.substring(0, 6)}`}
                        </AccordionSummary>
                        <AccordionDetails>
                            <code>
                                {Object.entries(accountInfo).map(([key, val]) => {
                                    return (
                                        <div key={key}>
                                            <span key={key}>
                                                {key}: {val}
                                            </span>
                                            <br />
                                        </div>
                                    );
                                })}
                            </code>
                        </AccordionDetails>
                    </Accordion>
                </>
            );
        } catch (e) {
            /* empty */
        }
        return val;
    }
    function clearStorage() {
        window.Telegram.WebApp.showConfirm("Are you sure you want to delete all storage data?", confirmed => {
            if (confirmed && storageManager) {
                storageManager.clearStorage();
                setTimeout(() => {
                    location.reload();
                }, 1500)
            }
        })
    }
    return (
        <div>
            <center>DevTools</center>
            {error ? (
                <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error">
                    Error: {error.toString()}
                </Alert>
            ) : (
                <></>
            )}
            <span>Cloud storage</span>
            <br />
            <Stack
                direction="row"
                sx={{ placeContent: "space-between", padding: "0 10px" }}
            >
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                        setUpdater((val) => val + 1);
                    }}
                >
                    <Refresh />
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                        setShowEncrypted((val) => !val);
                        setUpdater((val) => val + 1);
                    }}
                >
                    Show {showEncrypted ? "decrypted" : "encrypted"}
                </Button>
            </Stack>
            <TableContainer sx={{ maxHeight: 480 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Key</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cloud &&
                            Object.entries(cloud).map(([key, val]) => (
                                <TableRow key={key}>
                                    <TableCell
                                        sx={{
                                            maxWidth: 100,
                                            textOverflow: "ellipsis",
                                            overflow: "clip",
                                        }}
                                    >
                                        {key}
                                    </TableCell>
                                    <TableCell>
                                        {tryParse(val, !showEncrypted)}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                        <Button
                                            onClick={() => {
                                                promptSetItem(key);
                                            }}
                                            size="small"
                                            variant="outlined"
                                        >
                                            Set
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                deleteItem(key);
                                            }}
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Stack direction="row" sx={{ placeContent: "center" }} spacing={2}>
                <Button
                    onClick={() => {
                        saveSnapshot();
                    }}
                    variant="contained"
                >
                    Save snapshot
                </Button>
                <Button
                    onClick={() => {
                        loadSnapshot();
                    }}
                    variant="contained"
                >
                    Load snapshot
                </Button>
            </Stack>
            <span>Migration</span>

            <br />
            <ColorPicker selected={false} disableAlpha color={color} style={{ margin: 10 }} onChange={color => {setColor(color.hex)}} />

            <br />

            <Button onClick={() => {clearStorage()}} variant="outlined" color="error">Clear storage</Button>

            <center>{APP_VERSION}</center>
        </div>
    );
}
