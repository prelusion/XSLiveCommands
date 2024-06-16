
import {ipcMain} from "electron";
import {ConfigCoreStruct} from "../../shared/src/types/config";
import {readConfig} from "./config/readConfig";
import {writeConfig} from "./config/writeConfig";
import {resetConfig} from "./config/common";

export const useConfigFunctions = () => {
    const configIpc = () => {
        ipcMain.handle("config:readConfig", (_, version: number) => {
            return readConfig(version);
        });

        ipcMain.handle("config:writeConfig", (_, config: ConfigCoreStruct, version: number) => {
            return writeConfig(config, version);
        });

        ipcMain.handle("config:resetConfig", (_, version: number | null = null) => {
            return resetConfig(version);
        });
    }
    return {configIpc};
}
