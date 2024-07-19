import {err, ok, Result} from "../../../shared/src/types/result";
import {ConfigCoreStruct, ConfigStructLatest} from "../../../shared/src/types/config";
import {configFileExists, readJsonFile, resetConfig, upgradeConfigFile} from "./common";

/**
 *  Read the configuration file
 */
export async function readConfig(version: number): Promise<Result<ConfigStructLatest>> {
    if (!configFileExists()) {
        resetConfig(version);
    }

    try {
        const configFile = readJsonFile('config') as ConfigCoreStruct;

        if (!configFile.version) {
            return err("Missing config version");
        }

        return ok(upgradeConfigFile(configFile, version));
    } catch (e) {
        if (e instanceof SyntaxError) {
            return err("Invalid configuration file");
        } else {
            throw Error(`Unknown error occurred while trying to read the configuration file.`);
        }
    }
}
