/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import svgr from "vite-plugin-svgr";
import packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), svgr(), mkcert()],
    define: {
        APP_VERSION: JSON.stringify(packageJson.version),
        APP_HOMEPAGE: JSON.stringify(packageJson.homepage),
    },
    test: {
        globals: true,
        environment: "jsdom",
    },
});
