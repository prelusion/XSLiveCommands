import {ConfigCoreStruct} from "../../../shared/src/types/config";
import {upgradeConfigFile, writeJsonFile} from "./common";

export function writeConfig(config: ConfigCoreStruct, version: number): boolean {
    const upgradedConfig = upgradeConfigFile(config, version);
    return writeJsonFile('config', upgradedConfig);
}