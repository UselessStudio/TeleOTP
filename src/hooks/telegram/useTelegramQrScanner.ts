/**
 * Telegram QR scanner hook.
 * @param callback - a function that is executed after a successful scan.
 * @return A function to open the QR-code scanner.
 * Optionally, accepts `text` string as an argument.
 * The text to be displayed under the 'Scan QR' heading, 0-64 characters.
 */
export default function useTelegramQrScanner(callback: (scanned: string) => void): (text?: string) => void {
    return (text) => {
        window.Telegram.WebApp.showScanQrPopup({ text }, result => {
            callback(result);
            return true;
        });
    }
}
