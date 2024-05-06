import {ipcMain} from "electron";
import {ScheduledCommand} from "../../shared/src/types/commands/scheduled";
import {PlatformUser} from "../../shared/src/types/user";
import {exists} from "./filesys/exists";
import {getCompatibleMaps} from "./filesys/get-compatible-maps";
import {deleteXsDataFiles} from "./filesys/delete-xs-data-files";
import {readCommands} from "./filesys/read-commands";
import {readModsJson} from "./filesys/read-mods-json";
import {readTick} from "./filesys/read-tick";
import {writeCommand} from "./filesys/write-commands";

ipcMain.handle("fs:deleteXsDataFiles", (_, platform: PlatformUser, map: string) => {
    return deleteXsDataFiles(platform, map);
});

ipcMain.handle("fs:readTick", (_, platform: PlatformUser, map: string) => {
    return readTick(platform, map);
});

ipcMain.handle("fs:readCommands", (_, path: string) => {
    return readCommands(path);
});

ipcMain.handle("fs:writeCommand", (_, platform: PlatformUser, map: string, scheduledCommand: ScheduledCommand) => {
    return writeCommand(platform, map, scheduledCommand);
});

ipcMain.handle("fs:readModsJson", (_, platform: PlatformUser) => {
    return readModsJson(platform);
});

ipcMain.handle("fs:getCompatibleMaps", (_, platform: PlatformUser, modFolderPath: string) => {
    return getCompatibleMaps(platform, modFolderPath);
});

ipcMain.handle("fs:exists", (_, absolutePath: string) => {
    return exists(absolutePath);
});