export default function useTelegramQrScanner(callback: (scanned: string) => void): (text?: string) => void {
    return (text) => {
        window.Telegram.WebApp.showScanQrPopup({ text }, result => {
            callback(result);
            return true;
        });
    }
}
