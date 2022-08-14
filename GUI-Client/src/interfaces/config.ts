import {valueof} from "./general";

export interface ConfigFileCoreFormat {
    'version': number;
    'some-other-key': string;
}

export interface ConfigFileFormatV01 extends ConfigFileCoreFormat {
    'last-scenario-path': string;
    'custom-server-hostport': string;
}

/**
 * All config file formats (A little more constraint version of unknown)
 */
export type AnyConfigFileFormat = ConfigFileCoreFormat
    | ConfigFileFormatV01;

/**
 * The newest config file format to work with
 */
export type ConfigFileFormatNewest = ConfigFileFormatV01;
