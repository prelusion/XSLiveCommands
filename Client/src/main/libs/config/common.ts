import fs from "fs";
import path from "path";
import {ConfigCoreStruct, ConfigStructLatest} from "../../../shared/src/types/config";
import {ensure} from "../../../shared/src/util/general";
import {configDefaults, ConfigDefaultsKey, upgradeConfigFileToVersion} from "../../util/config-data";

const USER_HOME_DIR = process.platform === "win32" ? ensure(process.env.USERPROFILE) : "~";

const XS_SYNC_SUBFOLDERS = [''];
const XS_SYNC_FILE_PATH = path.join(USER_HOME_DIR, ".xs-sync");

/** ========================================================================================
 *                            Configuration functions
 *  ======================================================================================*/

/**
 * Verify if all folders exist (so we don't get an error) when trying to read/write to them
 */
function verifyFolders(): void {
    if (!fs.existsSync(XS_SYNC_FILE_PATH)) {
        fs.mkdirSync(XS_SYNC_FILE_PATH);
    }
    for (const folder of XS_SYNC_SUBFOLDERS) {
        const folderPath = path.join(XS_SYNC_FILE_PATH, folder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
    }
}

/**
 * Read a file from the XS_SYNC_FILE_PATH path
 */
export function readFile(name: string, ext: string): string {
    verifyFolders();
    const filePath = path.join(XS_SYNC_FILE_PATH, `${name}.${ext}`);
    return fs.readFileSync(filePath, 'utf8');
}

/**
 * Read a json file from the XS_SYNC_FILE_PATH path & parse it to a JS object from JSON
 * @throws SyntaxError When the json is invalid
 */
export function readJsonFile(name: string): unknown {
    return JSON.parse(readFile(name, 'json'));
}

/**
 * Write a file to the XS_SYNC_FILE_PATH path
 */
export function writeFile(name: string, ext: string, value: string): boolean {
    verifyFolders();
    const filePath = path.join(XS_SYNC_FILE_PATH, `${name}.${ext}`);
    try {
        fs.writeFileSync(filePath, value);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Read a json file from the XS_SYNC_FILE_PATH path & parse it to a JS object from JSON
 * @throws SyntaxError When the json is invalid
 */
export function writeJsonFile(name: string, value: unknown): boolean {
    return writeFile(name, 'json', JSON.stringify(value));
}

/**
 * Upgrade the config file if necessary
 */
export function upgradeConfigFile(configFile: ConfigCoreStruct, version: number): ConfigStructLatest {
    if (configFile.version < version) {
        configFile = upgradeConfigFileToVersion(configFile, version);
    }
    return configFile as ConfigStructLatest;
}

/**
 * Check if the config file exists
 */
export function configFileExists(): boolean {
    const configPath = path.join(XS_SYNC_FILE_PATH, 'config.json')
    return fs.existsSync(configPath);
}

/** ========================================================================================
 *                                     Usage functions
 *  ======================================================================================*/

/**
 *  Write the configuration file
 */
export function resetConfig(version: number | null = null): boolean {
    if (version === null) {
        version = parseFloat(ensure(Object.keys(configDefaults).pop()));
    }

    const defaultConfig = configDefaults[version.toString() as ConfigDefaultsKey];
    if (!defaultConfig) {
        return false;
    }
    return writeJsonFile('config', defaultConfig);
}