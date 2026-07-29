import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { type FC, useEffect } from "react";

interface PinCodeInputProps {
    value: string;
    onChange(value: string): void;
    error?: boolean;
    disabled?: boolean;
}

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0"];

const PinCodeInput: FC<PinCodeInputProps> = ({
    value,
    onChange,
    error = false,
    disabled = false,
}) => {
    const append = (digit: string) => {
        if (disabled || value.length >= 4) return;
        onChange(`${value}${digit}`);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (disabled || event.ctrlKey || event.metaKey || event.altKey)
                return;

            if (/^\d$/.test(event.key)) {
                event.preventDefault();
                if (value.length < 4) onChange(`${value}${event.key}`);
                return;
            }

            if (event.key === "Backspace" || event.key === "Delete") {
                event.preventDefault();
                if (value.length > 0) onChange(value.slice(0, -1));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [disabled, onChange, value]);

    return (
        <Stack spacing={3} sx={{ width: "100%", alignItems: "center" }}>
            <Stack direction="row" spacing={1.5}>
                {Array.from({ length: 4 }, (_, index) => (
                    <Box
                        // biome-ignore lint/suspicious/noArrayIndexKey: Each index is a fixed PIN position.
                        key={index}
                        sx={{
                            alignItems: "center",
                            border: 2,
                            borderColor: error
                                ? "error.main"
                                : index === value.length
                                  ? "primary.main"
                                  : "divider",
                            borderRadius: 1.5,
                            display: "flex",
                            height: 58,
                            justifyContent: "center",
                            transition: "border-color 150ms ease",
                            width: 50,
                        }}
                    >
                        {index < value.length && (
                            <Box
                                sx={{
                                    bgcolor: error
                                        ? "error.main"
                                        : "text.primary",
                                    borderRadius: "50%",
                                    height: 12,
                                    width: 12,
                                }}
                            />
                        )}
                    </Box>
                ))}
            </Stack>

            <Box
                sx={{
                    display: "grid",
                    gap: 1,
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    width: "100%",
                }}
            >
                {keys.map((key) =>
                    key ? (
                        <ButtonBase
                            key={key}
                            disabled={disabled}
                            onClick={() => append(key)}
                            sx={{
                                bgcolor: "action.hover",
                                borderRadius: 1.5,
                                minHeight: 58,
                            }}
                        >
                            <Typography variant="h5">{key}</Typography>
                        </ButtonBase>
                    ) : (
                        <Box key="empty" />
                    ),
                )}
                <ButtonBase
                    aria-label="Delete digit"
                    disabled={disabled || value.length === 0}
                    onClick={() => onChange(value.slice(0, -1))}
                    sx={{
                        bgcolor: "action.hover",
                        borderRadius: 1.5,
                        minHeight: 58,
                    }}
                >
                    <BackspaceOutlinedIcon />
                </ButtonBase>
            </Box>
        </Stack>
    );
};

export default PinCodeInput;
