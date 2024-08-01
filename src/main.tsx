/* eslint-disable react/jsx-key */
import { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import Root, { LoadingIndicator } from "./Root.tsx";
import "./global.css";
import "@fontsource/inter";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";
import { Telegram } from "@twa-dev/types";

import { EncryptionManagerProvider } from "./managers/encryption.tsx";
import { StorageManagerProvider } from "./managers/storage/storage.tsx";
import { SettingsManagerProvider } from "./managers/settings.tsx";
import { PlausibleAnalyticsProvider } from "./components/PlausibleAnalytics.tsx";
import { BiometricsManagerProvider } from "./managers/biometrics.tsx";
import CacheProvider from "react-inlinesvg/provider";

// always loaded pages
import Accounts from "./pages/Accounts.tsx";
import EditAccount from "./pages/EditAccount.tsx";
import Settings from "./pages/Settings.tsx";
import {LocalizationManagerProvider} from "./managers/localization.tsx";

// lazy loaded pages
const CreateAccount = lazy(() => import("./pages/CreateAccount.tsx"));
const NewAccount = lazy(() => import("./pages/NewAccount.tsx"));
const ManualAccount = lazy(() => import("./pages/ManualAccount.tsx"));
const PasswordSetup = lazy(() => import("./pages/PasswordSetup.tsx"));
const ResetAccounts = lazy(() => import("./pages/ResetAccounts.tsx"));
const DevToolsPage = lazy(() => import("./pages/DevToolsPage.tsx"));
const IconBrowser = lazy(() => import("./pages/IconBrowser.tsx"));
const ExportAccounts = lazy(() => import("./pages/export/ExportAccounts.tsx"));
const QrExport = lazy(() => import("./pages/export/QrExport.tsx"));
const LinkExport = lazy(() => import("./pages/export/LinkExport.tsx"));
const SelectLanguage = lazy(() => import("./pages/SelectLanguage.tsx"));
const UserErrorPage = lazy(() => import("./pages/UserErrorPage.tsx"));


declare global {
    interface Window {
        Telegram: Telegram;
    }
}

export const IS_TELEGRAM_APP_SUPPORTED = window.Telegram.WebApp.isVersionAtLeast("6.9");

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route
            path="/"
            errorElement={import.meta.env.DEV ? <DevToolsPage /> : <UserErrorPage />}
            element={<Root />}
        >
            <Route index={true} element={<Accounts />} />
            <Route path="new" element={<NewAccount />} />
            <Route path="manual" element={<ManualAccount />} />
            <Route path="create" element={<CreateAccount />} />
            <Route path="icons" element={<IconBrowser />} />
            <Route path="edit" element={<EditAccount />} />
            <Route path="settings" element={<Settings />} />
            <Route path="settings/lang" element={<SelectLanguage />} />
            <Route path="reset" element={<ResetAccounts />} />
            <Route path="changePassword" element={<PasswordSetup change />} />
            <Route path="export" element={<ExportAccounts />} />
            <Route path="export/qr" element={<QrExport />} />
            <Route path="export/link" element={<LinkExport />} />
            {import.meta.env.DEV && (
                <Route path="devtools" element={<DevToolsPage />} />
            )}
        </Route>
    ),
    {
        basename: import.meta.env.BASE_URL,
    }
);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
    !IS_TELEGRAM_APP_SUPPORTED ? <div className={"outdated-container"}>
        <h1>Your Telegram app is outdated!</h1>
        </div> :
    <PlausibleAnalyticsProvider
        domain={import.meta.env.VITE_PLAUSIBLE_DOMAIN}
        apiHost={import.meta.env.VITE_PLAUSIBLE_API_HOST}
    >
        <SettingsManagerProvider>
            <LocalizationManagerProvider>
                <BiometricsManagerProvider>
                    <EncryptionManagerProvider>
                        <StorageManagerProvider>
                            <CacheProvider>
                                <Suspense fallback={<LoadingIndicator/>}>
                                    <RouterProvider router={router} />
                                </Suspense>
                            </CacheProvider>
                        </StorageManagerProvider>
                    </EncryptionManagerProvider>
                </BiometricsManagerProvider>
            </LocalizationManagerProvider>
        </SettingsManagerProvider>
    </PlausibleAnalyticsProvider>
);
