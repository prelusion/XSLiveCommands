
import {ipcMain} from "electron";
import {ConfigFileCoreFormat} from "../../shared/src/types/config";
import {readConfig} from "./config/readConfig";
import {writeConfig} from "./config/writeConfig";
import {resetConfig} from "./config/common";

ipcMain.handle("config:readConfig", (_, version: number) => {
    return readConfig(version);
});

ipcMain.handle("config:writeConfig", (_, config: ConfigFileCoreFormat, version: number) => {
    return writeConfig(config, version);
});

ipcMain.handle("config:resetConfig", (_, version: number | null = null) => {
    return resetConfig(version);
});
