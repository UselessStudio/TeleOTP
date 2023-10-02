import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './Root.tsx'
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import {Telegram} from "@twa-dev/types";
import Settings from "./pages/Settings.tsx";
import Accounts from "./pages/Accounts.tsx";
import NewAccount from "./pages/NewAccount.tsx";
import {EncryptionManagerProvider} from "./providers/encryption.tsx";
import ManualAccount from "./pages/ManualAccount.tsx";
import {CreateAccount} from "./pages/CreateAccount.tsx";
import EditAccount from "./pages/EditAccount.tsx";

import "@fontsource/inter";
import {StorageManagerProvider} from "./providers/storage.tsx";

declare global {
    interface Window {
        Telegram: Telegram;
    }
}

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Root />}>
            <Route index={true} element={<Accounts />} />
            <Route path="new" element={<NewAccount />} />
            <Route path="manual" element={<ManualAccount />} />
            <Route path="create" element={<CreateAccount />} />
            <Route path="edit" element={<EditAccount />} />
            <Route path="settings" element={<Settings />} />
        </Route>
    )
);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <EncryptionManagerProvider>
          <StorageManagerProvider>
              <RouterProvider router={router}/>
          </StorageManagerProvider>
      </EncryptionManagerProvider>
  </React.StrictMode>,
)
