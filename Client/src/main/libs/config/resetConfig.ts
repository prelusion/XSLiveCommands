import {ensure} from "../../../shared/src/util/general";
import {configDefaults, ConfigDefaultsKey} from "../../util/config-data";
import {writeJsonFile} from "./common";

/**
 *  Reset the configuration file
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
