import {
    deleteXsDataFiles,
    exists,
    getCompatibleMaps,
    readCommands,
    readTick,
    readModsJson,
    writeCommand,
} from "../main/libs/fs";
import {getSteamId} from "../main/libs/native-reg";

import {write} from "../main/libs/clipboard";
import {getEnvVar, resize, restart, exit} from "../main/libs/manager";
import {readConfig, resetConfig, writeConfig} from "../main/libs/config";

declare global {
    interface Window extends Window {
        registry: {
            getSteamId: typeof getSteamId;
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