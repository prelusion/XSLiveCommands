import {ConfigCoreStruct, ConfigStructLatest, ConfigStructV01} from "../../shared/src/types/config";

export const configDefaults = {
    '0.1': {
        'version': 0.1,
        'custom-server-hostport': '',
        'previous-map': {
            'path': '',
            'name': '',
        },
    } as ConfigStructV01,
};

export type ConfigDefaultsKey = keyof typeof configDefaults;

/**
 * Upgrade config file through the versions up till the version given
 *
 * @param config The config object
 * @param to The version to upgrade to
 */
export function upgradeConfigFileToVersion(config: ConfigCoreStruct, to: number): ConfigStructLatest {
    if (config.version > to) {
        throw Error("Unable to convert configuration to older version")
    } else if (config.version === to) {
        return config as ConfigStructLatest;
    }

    // Code to convert 0.1 to 0.2 to 0.3 etc.
    // Also loop so v0.1 can go through multiple versions to get to 0.3 for example

    return config as ConfigStructLatest;
}
