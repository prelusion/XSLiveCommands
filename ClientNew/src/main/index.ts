"use strict";

import {useMainDefaultIpc} from "./services/ipc-main";
import {app, session} from "electron";
import InitWindow from "./services/window-manager";
import {useMenu} from "@main/hooks/menu-hook"
import {useNativeFunctions} from "@main/libs/native";
import {useFileSystemFunctions} from "@main/libs/filesys";
import {useConfigFunctions} from "@main/libs/config";
import {useClipboardFunctions} from "@main/libs/clipboard";

function onAppReady() {
    const {defaultIpc} = useMainDefaultIpc();
    const {createMenu} = useMenu();

    defaultIpc();
    createMenu();

    const {nativeIpc} = useNativeFunctions();
    const {fileSystemIpc} = useFileSystemFunctions();
    const {configIpc} = useConfigFunctions();
    const {clipboardIpc} = useClipboardFunctions();

    nativeIpc();
    fileSystemIpc();
    configIpc();
    clipboardIpc();

    new InitWindow().initWindow();

    if (process.env.NODE_ENV === "development") {
        const {VUEJS_DEVTOOLS} = require("electron-devtools-vendor");

        session.defaultSession.loadExtension(VUEJS_DEVTOOLS, {
            allowFileAccess: true,
        });
        console.log("Installed: vue-devtools");
    }
}

app.whenReady().then(onAppReady);

app.on("window-all-closed", () => {
    app.quit();
});

app.on("browser-window-created", () => {
    console.log("window-created");
});

if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.removeAsDefaultProtocolClient("xs-live-commands");
        console.log("Due to the particularity of the framework, this cannot be used in the development environment");
    }
} else {
    app.setAsDefaultProtocolClient("xs-live-commands");
}
