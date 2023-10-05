export default function useTelegramHaptics(): {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void,
    notificationOccurred: (style: "error" | "success" | "warning") => void,
    selectionChanged: () => void,
} {
    return {
        impactOccurred: window.Telegram.WebApp.HapticFeedback.impactOccurred,
        notificationOccurred: window.Telegram.WebApp.HapticFeedback.notificationOccurred,
        selectionChanged: window.Telegram.WebApp.HapticFeedback.selectionChanged,
    };
}