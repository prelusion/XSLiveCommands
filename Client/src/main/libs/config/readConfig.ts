import {ConfigFileCoreFormat} from "../../../shared/src/types/config";
import {MainError} from "../../../shared/src/types/errors";
import {MainErrorTypes} from "../../../shared/src/util/errors";
import {createError} from "../../util/errors";
import {configFileExists, readJsonFile, resetConfig, upgradeConfigFile} from "./common";

/**
 *  Read the configuration file
 */
export function readConfig(version: number): ConfigFileCoreFormat | MainError {
    if (!configFileExists()) {
        resetConfig(version);
    }

    try {
        const configFile = readJsonFile('config') as ConfigFileCoreFormat;

        if (!configFile.version) {
            return createError("Missing config version", MainErrorTypes.INVALID_CONFIG)
        }

        return upgradeConfigFile(configFile, version);
    } catch (e) {
        if (e instanceof SyntaxError) {
            return createError("Invalid configuration file", MainErrorTypes.INVALID_CONFIG)
        } else {
            throw Error(`Unknown error occurred while trying to read the configuration file.`);
        }
    }
}
