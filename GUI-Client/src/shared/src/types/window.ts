import {
    deleteXsDataFiles,
    exists,
    getCompatibleMaps,
    readCommands,
    readCycle,
    readModsJson,
    writeEvent,
} from "../../../main/libs/fs";
import {getSteamId} from "../../../main/libs/native-reg";

import {write} from "../../../main/libs/clipboard";
import {getEnvVar, resize} from "../../../main/libs/manager";
import {readConfig, resetConfig, writeConfig} from "../../../main/libs/config";

declare global {
    interface Window {
        registry: {
            getSteamId: typeof getSteamId;
        };
        fs: {
            deleteXsDataFiles: typeof deleteXsDataFiles;
            readCycle: typeof readCycle;
            readCommands: typeof readCommands;
            writeEvent: typeof writeEvent;
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
        };
        config: {
            readConfig: typeof readConfig;
            writeConfig: typeof writeConfig;
            resetConfig: typeof resetConfig;
        };
    }
}