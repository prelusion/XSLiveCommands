import {ipcRenderer, shell} from "electron";
import type {getNativeSteamId} from "@main/libs/native";
import type {deleteXsDataFiles} from "@main/libs/filesys/delete-xs-data-files";
import type {readTick} from "@main/libs/filesys/read-tick";
import type {readCommands} from "@main/libs/filesys/read-commands";
import type {writeCommand} from "@main/libs/filesys/write-commands";
import type {readModsJson} from "@main/libs/filesys/read-mods-json";
import type {getCompatibleMaps} from "@main/libs/filesys/get-compatible-maps";
import type {exit, getEnvVar, resize, restart} from "@main/libs/manager";
import type {readConfig} from "@main/libs/config/readConfig";
import type {writeConfig} from "@main/libs/config/writeConfig";
import type {resetConfig} from "@main/libs/config/common";
import type {exists} from "@main/libs/filesys/exists";
import type {write} from "@main/libs/clipboard";
import {Store} from "pinia";

interface AnyObject {
    [key: string]: any;
}

declare global {
    interface Window {
        ipcRenderer: typeof ipcRenderer;
        systemInfo: {
            platform: string;
            release: string;
            arch: string;
            nodeVersion: string;
            electronVersion: string;
        };
        shell: typeof shell;
        crash: {
            start: () => void;
        };

        registry: {
            getSteamId: typeof getNativeSteamId;
        };
        fs: {
            deleteXsDataFiles: typeof deleteXsDataFiles;
            readTick: typeof readTick;
            readCommands: typeof readCommands;
            writeCommand: typeof writeCommand;
            readModsJson: typeof readModsJson;
            getCompatibleMaps: typeof getCompatibleMaps;
            exists: typeof exists;
        };
        clipboard: {
            write: typeof write;
        };
        manager: {
            resize: typeof resize;
            getEnvVar: typeof getEnvVar;
            restart: typeof restart;
            exit: typeof exit;
        };
        config: {
            readConfig: typeof readConfig;
            writeConfig: typeof writeConfig;
            resetConfig: typeof resetConfig;
        };
    }
}

interface ComponentCustomProperties {
    $store: Store
}
