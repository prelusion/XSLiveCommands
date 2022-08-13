import {AnyConfigFileFormat, ConfigFileCoreFormat} from "../../src/interfaces/config";

export const configDefaults: Record<string, AnyConfigFileFormat> = {
    '0.1': {
        'version': 0.1,
        'last-scenario-path': '',
        'custom-server-hostport': ''
    }
};

/**
 * Upgrade config file through the versions up till the version given
 *
 * @param config The config object
 * @param to The version to upgrade to
 */
export function upgradeConfigFileToVersion(config: ConfigFileCoreFormat, to: number): ConfigFileCoreFormat {
    if (config.version > to) {
        throw Error("Unable to convert configuration to older version")
    } else if (config.version === to) {
        return config;
    }

    // Code to convert 0.1 to 0.2 to 0.3 etc.
    // Also loop so v0.1 can go through multiple versions to get to 0.3 for example

    return config;
}
