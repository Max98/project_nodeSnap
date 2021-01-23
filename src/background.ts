"use strict";

import { Modal } from "bootstrap";
import { app, protocol, BrowserWindow, ipcMain } from "electron";
const path = require("path");
const os = require("os");
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
const isDevelopment = process.env.NODE_ENV !== "production";
import ModalsManager from "./components/Modals/Modals";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: "app", privileges: { secure: true, standard: true } }
]);

let win: BrowserWindow;
async function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            webSecurity: true,
            allowRunningInsecureContent: true,
            enableRemoteModule: true,
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: (process.env
                .ELECTRON_NODE_INTEGRATION as unknown) as boolean
        }
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
        if (!process.env.IS_TEST) win.webContents.openDevTools();

        win.webContents.send("setId", { id: "Main" });
    } else {
        createProtocol("app");
        // Load the index.html when not in development
        win.loadURL("app://./index.html");
    }

    win.webContents.on("did-finish-load", () => {
        win.webContents.send("setId", { id: "Main" });
    });

    win.on("close", () => {
        ModalsManager.getInstance().dispose();
    });

    win.on("closed", () => {
        app.quit();
    });

    /**
     * Init
     */
    new ModalsManager();
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        /**
         * Since this is Vue 3, we need to download the beta extention.
         * You can download it on your browser (chromuim based) and set the path here
         */
        /*await session.defaultSession.loadExtension(
      "C:/Users/Moncef/AppData/Local/BraveSoftware/Brave-Browser/User Data/Default/Extensions/ljjemllljcmogpfapbkkighbhhppjdbg/6.0.0.3_0"
    );*/
    }
    createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === "win32") {
        process.on("message", data => {
            if (data === "graceful-exit") {
                app.quit();
            }
        });
    } else {
        process.on("SIGTERM", () => {
            app.quit();
        });
    }
}

/**
 * Renderer -> mainThread communication
 */
ipcMain.on("setModalVisibility", (event, arg) => {
    ModalsManager.getInstance().setModalVisibility(
        arg.name,
        arg.state,
        arg.data
    );
});

ipcMain.on("hideAllModals", (event, arg) => {
    ModalsManager.getInstance().hideAllModals();
});

/**
 * Settings
 */
ipcMain.on("set-settings", (event, arg) => {
    win.webContents.send("set-settings", arg);
});

/**
 * Groups
 */
ipcMain.on("grpEdit", (event, arg) => {
    win.webContents.send("grpEdit", arg);
});

/**
 * Blueprints
 */
ipcMain.on("blueprintEdit", (event, arg) => {
    win.webContents.send("blueprintEdit", arg);
});

ipcMain.on("modelEdit", (event, arg) => {
    win.webContents.send("modelEdit", arg);
});
