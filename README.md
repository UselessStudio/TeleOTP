# 🔐 [TeleOTP](http://t.me/TeleOTPAppBot)
[![Deploy static content to Pages](https://github.com/UselessStudio/TeleOTP/actions/workflows/deploy.yml/badge.svg)](https://github.com/UselessStudio/TeleOTP/actions/workflows/deploy.yml)
[![Build Telegram bot image](https://github.com/UselessStudio/TeleOTP/actions/workflows/bot.yml/badge.svg)](https://github.com/UselessStudio/TeleOTP/actions/workflows/bot.yml)
[![Plausible analytics](https://img.shields.io/badge/Plausible-analytics-blue)](https://analytics.gesti.tech/teleotp.gesti.tech)

Telegram Mini App that allows you to generate one-time 2FA passwords inside Telegram.

## ✨ Features

* ✅ **Universal:** TeleOTP implements [TOTP](https://en.wikipedia.org/wiki/Time-based_one-time_password) (Time-Based One-Time Password Algorithm) which is used by most services.
* 👌 **Convenient:** Accounts are safely stored in your Telegram cloud storage, 
so you can access them anywhere you can use Telegram. 
* 🔒 **Secure:** All accounts are encrypted using AES. 
That means even if your Telegram account is breached, 
the attacker won't have access to your tokens without the encryption password. 
* 🥰 **User-friendly:** TeleOTP is designed to look like Telegram and follows your color theme.
* 🤗 **Open:** TeleOTP supports account migration to and from Google Authenticator. 
You can switch the platforms at any time without any hassle! 

## Table of contents
<!-- TOC -->
* [🔐 TeleOTP](#-teleotp)
  * [✨ Features](#-features)
  * [Table of contents](#table-of-contents)
* [⚙️ Setup guide](#-setup-guide)
  * [📱 Mini App](#-mini-app)
    * [Installing the dependencies](#installing-the-dependencies)
    * [Configuring the environment](#configuring-the-environment)
    * [Starting the development server](#starting-the-development-server)
    * [Building the app](#building-the-app)
    * [🔁 CI/CD](#-cicd)
  * [💬 Bot](#-bot)
    * [Starting bot](#starting-bot)
    * [Environment variables](#environment-variables)
    * [Running in Docker](#running-in-docker)
    * [🔁 CI/CD](#-cicd-1)
* [💻 Structure](#-structure)
  * [🛣️ Routing](#-routing)
  * [🤖 Data and business logic](#-data-and-business-logic)
    * [🪝 Hooks](#-hooks)
      * [⬅️ Telegram Back Button](#-telegram-back-button)
      * [📳 Telegram Haptics](#-telegram-haptics)
      * [✅ Telegram Main Button](#-telegram-main-button)
      * [📷 Telegram QR Scanner](#-telegram-qr-scanner)
      * [🎨 Telegram Theme](#-telegram-theme)
      * [🔑 Account](#-account)
    * [👁️ Biometrics manager](#-biometrics-manager)
      * [isAvailable](#isavailable)
      * [isSaved](#issaved)
      * [updateToken](#updatetoken)
      * [getToken](#gettoken)
    * [⚙️ Settings manager](#-settings-manager)
      * [shouldKeepUnlocked](#shouldkeepunlocked)
      * [setKeepUnlocked](#setkeepunlocked)
      * [lastSelectedAccount](#lastselectedaccount)
      * [setLastSelectedAccount](#setlastselectedaccount)
    * [🔐 Encryption manager](#-encryption-manager)
      * [storageChecked](#storagechecked)
      * [passwordCreated](#passwordcreated)
      * [createPassword](#createpassword)
      * [removePassword](#removepassword)
      * [isLocked](#islocked)
      * [unlock](#unlock)
      * [lock](#lock)
      * [oldKey](#oldkey)
      * [encrypt](#encrypt)
      * [decrypt](#decrypt)
    * [💾 Storage manager](#-storage-manager)
      * [ready](#ready)
      * [accounts](#accounts)
      * [saveAccount](#saveaccount)
      * [saveAccounts](#saveaccounts)
      * [removeAccount](#removeaccount)
      * [clearStorage](#clearstorage)
    * [✈️ Migration](#-migration)
      * [Caveats](#caveats)
    * [🤗 Icons and colors](#-icons-and-colors)
      * [➕ Adding custom icons](#-adding-custom-icons)
* [📋 TODOs](#-todos)
* [👋 Acknowledgements](#-acknowledgements)
  * [🖌️ Content](#-content)
  * [📚 Libraries used](#-libraries-used)
<!-- TOC -->

# ⚙️ Setup guide

## 📱 Mini App

TeleOTP is made with **React**, **Typescript**, and **[Material UI](https://mui.com/material-ui/)**. 
**Vite** frontend tooling is used for rapid development and easy deployment.

### Installing the dependencies

To begin working with the project, 
you should install the dependencies by running this command:

```shell
npm install
```

### Configuring the environment

Before starting the server or building the app, make sure that 
your project directory has a file named `.env`. 
It should follow the `.env.example` file structure.
You could also set these variables directly when running the app.

The app uses following environment variables:

* `VITE_BOT_USERNAME` - This value contains the bot username. 
It is used to send export requests to the bot. 
_Example: `VITE_BOT_USERNAME=TeleOTPAppBot`_

### Starting the development server
To start the development server with hot reload, run:

```shell
npm run dev
```

After that, the server will be accessible on http://localhost:5173/

> [!NOTE]
> If you want the app to be accessible on your local network, you should add `--host` argument to the command

```shell
npm run dev -- --host
```

### Building the app

```shell
npm run build
```
After a successful build, app bundle will be available in `./dist`.

### 🔁 CI/CD
GitHub Actions is used to automate the deployment of the app to the **GitHub Pages**. 
The workflow is defined in the [`deploy.yml` file](.github/workflows/deploy.yml) 
and ran on every push to `main`.

## 💬 Bot

TeleOTP uses a helper bot to send user a link to the app and assist with account migration.
The bot is written in **Python** using [Python Telegram Bot library](https://github.com/python-telegram-bot/python-telegram-bot).

### Starting bot

To start the bot, you have to run the `main.py` script with environment variables.
```shell
python main.py
```

### Environment variables

* `TOKEN` - Telegram bot token provided by @BotFather
* `TG_APP` - A link to the Mini App in Telegram (e.g. https://t.me/TeleOTPAppBot/app)
* `WEBAPP_URL` - Deployed Mini App URL (e.g. https://uselessstudio.github.io/TeleOTP)

> [!NOTE]
> Make sure that `WEBAPP_URL` doesn't end with a `/`! 
> It is added automatically by the bot.

### Running in Docker

We recommend running the bot inside the Docker container. 
The latest image is available at `ghcr.io/uselessstudio/teleotp-bot:main`.

Example `docker-compose.yml` file:

```yaml
services:
  bot:
    image: ghcr.io/uselessstudio/teleotp-bot:main
    restart: unless-stopped
    environment:
      - TG_APP=https://t.me/TeleOTPAppBot/app
      - WEBAPP_URL=https://uselessstudio.github.io/TeleOTP
      - TOKEN=<insert your token>
```

And running is as simple as:
```shell
docker compose up
```

### 🔁 CI/CD
GitHub Actions is used to automate the building of the bot container.
The workflow is defined in the [`bot.yml` file](.github/workflows/bot.yml)
and ran on every push to `main`. After a successful build, 
the container is published in the GitHub Container Registry.  


# 💻 Structure

## 🛣️ Routing

TeleOTP uses React Router to switch between pages. 
Routes are specified in the `main.tsx` file.

* Route implemented in `Root.tsx` is responsible for showing "required" screens:
  * `PasswordSetup.tsx` is a screen which is showed when no password is created.
  Alternatively, this screen is shown when user clicked a button to change the password.
  It displays a prompt to create a new password which is used to encrypt the accounts.
  * `Decrypt.tsx` is a screen which shows a password prompt to decrypt stored accounts.
  By default, it is shown only once on a new device. 
  Later, the password retrieved from `localStorage` (if not disabled in the settings).
* `Accounts.tsx` is the main screen, which shows the generated password and a list of accounts that user has.
* `NewAccount.tsx` is a screen, which prompts user to open the QR-code scanner. 
Otherwise, user could press a button to enter an account manually, which would redirect them to `ManualAccount.tsx`
* `ManualAccount.tsx` prompts user to enter a secret for an OTP account.
* `CreateAccount.tsx` is a final step in the account creation flow. User is redirected here after scanning a QR-code 
or after manually providing a secret. 
This screen allows user to change issuer and label and to select an icon with a color for the account.
* `EditAccount.tsx` is a screen similar to `CreateAccount.tsx` which allows 
user to edit or delete an account. 
* `Settings.tsx` is a menu screen with a few options. User can delete all accounts, 
encrypt them, change the password, or set preferences.
* `ExportAccounts.tsx` is a page that handles the export logic. 
This page could be opened only by pressing the keyboard button in the chat. 
It sends the exported accounts back to the bot.
* `ResetAccounts.tsx` is a page that verifies that the user wants to delete all accounts and reset the password. 
This page can be accessed through the settings, or by typing in the password incorrectly when decrypting.

## 🤖 Data and business logic

### 🪝 Hooks

#### ⬅️ Telegram Back Button

```ts
import useTelegramBackButton from "./useTelegramBackButton";

useTelegramBackButton(): void
```

This hook sends a request to telegram to display button to navigate back in history. 
It is used only once in `Root.tsx`. 
This hook automatically shows the button if the current route is not root (`/`).
To navigate back, `useNavigate(-1)` hook from React Router is used.

#### 📳 Telegram Haptics

```ts
import useTelegramHaptics from "./useTelegramHaptics";

useTelegramHaptics(): {
  impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void,
  notificationOccurred: (style: "error" | "success" | "warning") => void,
  selectionChanged: () => void,
}
```

This hook wraps the Telegram [HapticFeedback](https://core.telegram.org/bots/webapps#hapticfeedback) object.

_Returns:_
* `impactOccurred` A method tells that an impact occurred.
  * `style` 
    - `light`, indicates a collision between small or lightweight UI objects,
    - `medium`, indicates a collision between medium-sized or medium-weight UI objects,
    - `heavy`, indicates a collision between large or heavyweight UI objects,
    - `rigid`, indicates a collision between hard or inflexible UI objects,
    - `soft`, indicates a collision between soft or flexible UI objects.
* `notificationOccurred` A method tells that a task or action has succeeded, failed, or produced a warning.
  * `style`
    - error, indicates that a task or action has failed,
    - success, indicates that a task or action has completed successfully,
    - warning, indicates that a task or action produced a warning.
* `selectionChanged` A method tells that the user has changed a selection.

#### ✅ Telegram Main Button

```ts
import useTelegramMainButton from "./useTelegramMainButton";

useTelegramMainButton(onClick: () => boolean, text: string, disabled: boolean = false): void
```
_Params:_
* `onClick` is a callback that is executed when user presses the button.
If the callback returns true, the button will be hidden.
* `text` is a string which contains the text that should be displayed on the button.
* `disabled` (default `false`) is a boolean flag that indicates, whether the button should be disabled or not.

This hook shows a main button and adds the callback as the listener for clicks.
The button is automatically hidden if the component using this hook is disposed.

#### 📷 Telegram QR Scanner

```ts
import useTelegramQrScanner from "./useTelegramQrScanner";

useTelegramQrScanner(callback: (scanned: string) => void): (text?: string) => void
```

_Params:_
* `callback` is a function that is executed after a successful scan.
  * argument `scanned` contains the contents of the QR-code. 

_Returns:_

A function to open the QR-code scanner. 
Optionally, accepts `text` string as the argument.
The text to be displayed under the 'Scan QR' heading, 0-64 characters.

#### 🎨 Telegram Theme

```ts
import useTelegramTheme from "./useTelegramTheme";

useTelegramTheme(): Theme
```

Creates a Material UI theme from Telegram-provided color palette. 
This hook automatically listens for theme change events. 

_Returns:_

A Material UI theme, to be used with `ThemeProvider`:
```tsx
<ThemeProvider theme={theme}>
```

#### 🔑 Account

```ts
import useAccount from "./useAccount";

useAccount(accountUri?: string): { code: string, period: number, progress: number }
```

_Params:_ 

* `accountUri` is a string which contains a [key URI](https://github.com/google/google-authenticator/wiki/Key-Uri-Format).

_Returns:_

* `code` is the generated code string.
* `period` is the token time-to-live duration in seconds.
* `progress` is the current token lifespan progress. A number between 0 (fresh) and 1 (expired).

This hook generates the actual 2FA code. Progress is updated every 300ms. 
If `accountUri` is not provided or invalid, the code returned is "N/A". 

Generation of codes is implemented in the [otpauth library](https://github.com/hectorm/otpauth).

### 👁️ Biometrics manager

`BiometricsManager` is used as an interface to Telegram's `WebApp.BiometricManager`. 
It allows to store the encryption key inside secure storage on device, locked by a biometric lock.

To get an instance of BiometricsManager, you should use the `useContext` hook:

```ts
import {BiometricsManagerContext} from "./biometrics";

const biometricsManager = useContext(BiometricsManagerContext);
```

BiometricsManager is created using `BiometricsManagerProvider` component:

> [!IMPORTANT]
> BiometricsManagerProvider must be used inside the [SettingsManagerProvider](#-settings-manager)

- `requestReason` is a message when user is prompted to provide necessary permissions
- `authenticateReason` is a message shown to the user, when the key is requested

```tsx
import {BiometricsManagerProvider} from "./biometrics";

<BiometricsManagerProvider requestReason="Allow access to biometrics to be able to decrypt your accounts"
                           authenticateReason="Authenticate to decrypt your accounts">
  ... rest of the app code ...
</BiometricsManagerProvider>
```

#### isAvailable

```ts
isAvailable: boolean;
```

Boolean flag indicating whether biometric storage is available on the current device.

#### isSaved

```ts
isSaved: boolean;
```

Boolean flag indicating whether the encryption key is saved inside the storage. 
This flag is stored using the [`SettingsManager`](#-settings-manager).

> [!NOTE]
> Behaviour of this flag is different to `WebApp.BiometricManager.isBiometricTokenSaved`, as
> in the current implementation `isBiometricTokenSaved` returns `true` even if a token is empty.  

#### updateToken

```ts
updateToken(token: string): void;
```

This method saves the key inside secure storage. 
It may ask the user for necessary permissions.
To delete the stored key, pass empty string to the `token` parameter.

#### getToken

```ts
getToken(callback: (token?: string) => void): void;
```

This method requests a token from the storage. If a request is successful, 
the token is passed in the `token` parameter inside a callback. In case of a failure, 
callback is called with empty `token`.

### ⚙️ Settings manager

SettingsManager is used to provide the app with user's preferences. 
Currently, SettingsManager stores settings in the `localStorage`, 
so the state is NOT persistent between devices, even on the same Telegram account.


#### shouldKeepUnlocked

```ts
shouldKeepUnlocked: boolean;
```

This flag indicates whether the app should stay in the unlocked state between restarts.

#### setKeepUnlocked

```ts
setKeepUnlocked(keep: boolean): void;
```

This method changes the value of the [`shouldKeepUnlocked` flag](#shouldkeepunlocked).

#### lastSelectedAccount

```ts
lastSelectedAccount: string | null;
```

This value contains the id of the account that was previously selected. If this value is missing in the storage, 
returns null.

> [!NOTE]
> The id returned in this method is NOT checked to be a valid account id.

#### setLastSelectedAccount

```ts
setLastSelectedAccount(id: string): void;
```

This method updates the [last selected account value](#lastselectedaccount) in the storage. 

### 🔐 Encryption manager

EncryptionManager is used to handle everything related to encryption. 
It is responsible for unlocking the storage, checking passwords, and encrypting/decrypting data.
Currently, [AES-128](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) encryption
and [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) key derive function are implemented.

The actual encryption methods used are implemented in the [CryptoJS](https://www.npmjs.com/package/crypto-js) library.

User's password is not stored anywhere outside the device itself. 
Instead, [Key Checksum Value](https://en.wikipedia.org/wiki/Key_checksum_value) is used to 
verify the validity of the entered key. After a successful password entry, 
the derived key is stored in the `localStorage` (if not disabled in settings). 

To get an instance of EncryptionManager, you should use the `useContext` hook:

```ts
import {EncryptionManagerContext} from "./encryption";

const encryptionManager = useContext(EncryptionManagerContext);
```

EncryptionManager is created using `EncryptionManagerProvider` component:

> [!IMPORTANT]
> EncryptionManagerProvider must be used inside the [SettingsManagerProvider](#-settings-manager)

```tsx
import {EncryptionManagerProvider} from "./encryption";

<EncryptionManagerProvider>
  ... rest of the app code ...
</EncryptionManagerProvide>
```

#### storageChecked

```ts
storageChecked: boolean;
```

This is a boolean indicating if KCV and password salt were read from the storage. 
The app should wait for this value to be `true` to try to unlock the EncryptionManager
or use encrypt/decrypt methods.

#### passwordCreated

```ts
passwordCreated: boolean | null;
```

This flag indicates that the password exists, and it's salt and KCV are in the storage.
Its value is `null` when EncryptionManager haven't checked the storage yet.

#### createPassword

```ts
createPassword(password: string): void;
```

This method is used to create a new password or change the existing one. 
Password should be provided in the plaintext form. If this method is called 
with the EncryptionManager being unlocked, 
the previous key is stored in the [`oldKey` variable](#oldkey).

#### removePassword

```ts
removePassword(): void;
```

This method removes the salt and KCV from the storage. 
After it is called, [`passwordCreated`](#passwordcreated) would become `false`.

#### isLocked

```ts
isLocked: boolean;
```

This flag indicates whether EncryptionManager is locked or not. If it is equal to `true`, 
the user should unlock the storage using the [`unlock` method](#unlock)

#### unlock

```ts
unlock(password: string): boolean;
```

This method takes in the plaintext password from the user, 
verifies the validity using KCV, and stores the key locally in case of success.
After the successful execution of this method, [`isLocked`](#islocked) 
would change to `false`.

_Returns:_ a boolean indicating whether the provided password is correct.

#### lock

```ts
lock(): void;
```

This method removes the stored key from `localStorage`
After the execution of this method, [`isLocked`](#islocked) 
would change to `true`.

#### oldKey

```ts
oldKey: crypto.lib.WordArray | null;
```

This variable contains the previous password's key. It is used to
indicate that the password was changed to 
re-encrypt the accounts with the correct new key.

#### encrypt

```ts
encrypt(data: string): string | null;
```

This method encrypts the `data` string with the stored key
and returns the corresponding ciphertext.
This method will return `null` if the EncryptionManager is locked.

#### decrypt

```ts
decrypt(data: string): string | null;
```

This method decrypts the `data` string with the stored key
and returns the corresponding plaintext.
This method will return `null` if the EncryptionManager is locked.

### 💾 Storage manager

StorageManager is responsible for saving and restoring accounts from Telegram's CloudStorage.
StorageManager encrypts the accounts by calling [`encrypt`](#encrypt)/[`decrypt`](#decrypt) 
methods on the [EncryptionManager](#-encryption-manager).

Telegram CloudStorage is limited to 1024 keys. A few of these keys are used to store 
the data for the decryption and more could be used later for other features. 
Each account is stored as the different CloudStorage item, 
so the limit of the accounts is around 1000. We do not limit the amount of the accounts that user has 
because this number is somewhat impractical in real-world use.  

Account object is defined as:

```ts
import {Color, Icon} from "./globals";

interface Account {
  id: string;
  label: string;
  issuer?: string;
  uri: string;
  color: Color;
  icon: Icon;
}
```

To get an instance of StorageManager, you should use the `useContext` hook:

```ts
import {StorageManagerContext} from "./storage";

const encryptionManager = useContext(StorageManagerContext);
```

StorageManager is created using `StorageManagerProvider` component:

> [!IMPORTANT]
> StorageManagerProvider must be used inside the [EncryptionManagerProvider](#-encryption-manager)

```tsx
import {StorageManagerProvider} from "./encryption";

<StorageManagerProvider>
  ... rest of the app code ...
</StorageManagerProvider>
```

#### ready

```ts
ready: boolean;
```

This is a boolean flag indicating if the StorageManager had loaded and decrypted the accounts.
If this flag is `false`, UI should display a loading indicator.

#### accounts

```ts
accounts: Record<string, Account>;
```

This is an object containing every account currently in the storage. 
The key is a string id of the account. 
This object is updated every time a new account is saved/removed.

#### saveAccount

```ts
saveAccount(account: Account): void;
```

> [!NOTE]
> If you need to save multiple accounts, use `saveAccounts`

This method saves the provided account in the CloudStorage.
If the account with the same id exists, it is overridden.

#### saveAccounts

```ts
saveAccount(accounts: Account[]): void;
```

This method is should be used if needed to save multiple accounts.
The only difference in this method and running `saveAccount` in a loop is 
that `saveAccounts` doesn't update the state for each account. 

#### removeAccount

```ts
removeAccount(id: string): void;
```

This method removes the account with provided `id` from the CloudStorage.

#### clearStorage

```ts
clearStorage(): void;
```

This method clears the entirety of the CloudStorage. 
It removes accounts and password salt with KCV.
After this method is executed, the [`removePassword` method](#removepassword) 
on EncryptionManager is executed to ensure that the account was deleted. 

### ✈️ Migration

TeleOTP implements the `otpauth-migration` URI standard. 
During the migration, accounts are serialized using Protocol Buffers 
and sent to the bot via `sendData` method. Bot then generates the QR-code and a link, 
that can be used for migrating to another instance of TeleOTP.

#### Caveats

The length of the data that can be sent using `sendData` is limited to 4096 bytes. 
So the quantity of the accounts that could be migrated from TeleOTP is limited. 
Although, this number theoretically is pretty big, it is still smaller than 
the amount of the accounts that can be stored in CloudStorage (around 1000).   

### 🤗 Icons and colors

All the icons and colors for accounts are defined in the `globals.tsx` file.
Available icons are exported in the `icons` const, colors are available in the `colors` const.
`Icon` and `Color` types are provided for checking the validity of the corresponding item.

#### ➕ Adding custom icons

You have two options regarding adding a custom icon:
* Use the [Material UI icons](https://mui.com/material-ui/material-icons/). 

Adding a Material UI icon is as simple as creating a new entry in the `icons` object.
The key should uniquely identify the icon. The value should be an SvgIconComponent imported from `@mui/icons-material`.

```ts
import StarIcon from '@mui/icons-material/Star';

export const icons: Record<string, SvgIconComponent> = {
    "star": StarIcon,
    ...
} as const;
```
* Provide a custom SVG icon.

First of all, the icon should be added to the `src/assets/icons` folder. 
We recommend getting the icons at https://simpleicons.org/.
Then, the SvgIconComponent should be created using the `createSvgIcon` function, 
adding the icon are the same steps as with the Material UI icons:

```tsx
// Make sure to add `?react` to the icon path.
// This makes the imported icon a React Component.
import Discord from "./assets/icons/discord.svg?react"; 

const DiscordIcon = createSvgIcon(<Discord/>, "Discord");

export const icons: Record<string, SvgIconComponent> = {
  "discord": DiscordIcon,
  ...
} as const;
```

# 📋 TODOs

* [ ] Implement counter-based HOTP
* [ ] Add more icons
* [ ] Add localization

# 👋 Acknowledgements

## 🖌️ Content

* Emoji animations from [Telegram stickers](https://t.me/addstickers/AnimatedEmojies).
* [Duck stickers](https://t.me/addstickers/UtyaDuck)
* Brand icons from [Simple Icons](https://simpleicons.org/)

## 📚 Libraries used

* [@twa-dev/types](https://github.com/twa-dev/types) - Typescript types for Telegram Mini App SDK 
* [OTPAuth](https://www.npmjs.com/package/otpauth) - generating TOTP codes
* [nanoid](https://www.npmjs.com/package/nanoid) - generating unique ids for accounts
* [lottie-react](https://www.npmjs.com/package/lottie-react) - rendering lottie animations
* [copy-text-to-clipboard](https://www.npmjs.com/package/copy-text-to-clipboard) - copying codes to the clipboard

TeleOTP is made for [Telegram Mini App Contest](https://t.me/contest/327).

Designed by [@lunnaholy](https://github.com/lunnaholy),
implemented by [@LowderPlay](https://github.com/LowderPlay) with ❤️
