import fs from "fs";
import {ipcMain} from "electron";
import {ConfigFileCoreFormat, ConfigFileFormatNewest} from "../../shared/src/types/config";
import {configDefaults, ConfigDefaultsKey, upgradeConfigFileToVersion} from "../util/config-data";
import {MainError} from "../../shared/src/types/errors";
import {createError} from "../util/errors";
import {MainErrorTypes} from "../../shared/src/util/errors";

// windows specific:
const USER_PROFILE_PATH = process.env.USERPROFILE;

const XS_SYNC_SUBFOLDERS = [''];
const XS_SYNC_FILE_PATH = `${USER_PROFILE_PATH}\\.xs-sync\\`

/** ========================================================================================
 *                            Configuration functions
 *  ======================================================================================*/

/**
 * Verify if all folders exist (so we don't get an error) when trying to read/write to them
 */
function verifyFolders(): void {
    if (!fs.existsSync(XS_SYNC_FILE_PATH)) fs.mkdirSync(XS_SYNC_FILE_PATH);
    for (const folder of XS_SYNC_SUBFOLDERS) {
        const path = `${XS_SYNC_FILE_PATH}\\${folder}\\`
        if (!fs.existsSync(path)) fs.mkdirSync(path);
    }
}

/**
 * Read a file from the XS_SYNC_FILE_PATH path
 */
function readFile(name: string, ext: string): string {
    verifyFolders();
    return fs.readFileSync(`${XS_SYNC_FILE_PATH + name}.${ext}`, 'utf8');
}

/**
 * Read a json file from the XS_SYNC_FILE_PATH path & parse it to a JS object from JSON
 * @throws SyntaxError When the json is invalid
 */
function readJsonFile(name: string): unknown {
    return JSON.parse(readFile(name, 'json'));
}

/**
 * Write a file to the XS_SYNC_FILE_PATH path
 */
function writeFile(name: string, ext: string, value: string): boolean {
    verifyFolders();
    try {
        fs.writeFileSync(`${XS_SYNC_FILE_PATH + name}.${ext}`, value);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Read a json file from the XS_SYNC_FILE_PATH path & parse it to a JS object from JSON
 * @throws SyntaxError When the json is invalid
 */
function writeJsonFile(name: string, value: unknown): boolean {
    return writeFile(name, 'json', JSON.stringify(value));
}

/**
 * Upgrade the config file if necessary
 */
function upgradeConfigFile(configFile: ConfigFileCoreFormat, version: number): ConfigFileFormatNewest {
    if (configFile.version < version) {
        configFile = upgradeConfigFileToVersion(configFile, version);
    }
    return configFile as ConfigFileFormatNewest;
}

/**
 * Check if the config file exists
 */
function configFileExists(): boolean {
    return fs.existsSync(`${XS_SYNC_FILE_PATH + 'config.json'}`);
}

/** ========================================================================================
 *                                     Usage functions
 *  ======================================================================================*/

/**
 *  Write the configuration file
 */
export function resetConfig(version: number): boolean {
    const defaultConfig = configDefaults[version.toString() as ConfigDefaultsKey];
    if (!defaultConfig) {
        return false;
    }
    return writeJsonFile('config', defaultConfig);
}

/**
 *  Read the configuration file
 */
export function readConfig(version: number): ConfigFileCoreFormat|MainError {
    if (!configFileExists()) {
        resetConfig(version);
    }

    try {
        const configFile = readJsonFile('config') as ConfigFileCoreFormat;
        return upgradeConfigFile(configFile, version);
    } catch (e) {
        if (e instanceof SyntaxError) {
            return createError("Invalid configuration file", MainErrorTypes.INVALID_CONFIG)
        } else {
            throw Error(`Unknown error occurred while trying to read the configuration file.`);
        }
    }
}

/**
 *  Write the configuration file
 */
export function writeConfig(config: ConfigFileCoreFormat, version: number): boolean {
    const upgradedConfig = upgradeConfigFile(config, version);
    return writeJsonFile('config', upgradedConfig);
}

/** ========================================================================================
 *                         Handlers for wrapping the above functions
 *  ======================================================================================*/

ipcMain.handle("config:readConfig", (_, version: number) => {
    return readConfig(version);
});

ipcMain.handle("config:writeConfig", (_, config: ConfigFileCoreFormat, version: number) => {
    return writeConfig(config, version);
});

ipcMain.handle("config:resetConfig", (_, version: number) => {
    return resetConfig(version);
});
