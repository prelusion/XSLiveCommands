export interface ConfigFileCoreFormat {
    'version': number;
}

export interface ConfigFileFormatV01 extends ConfigFileCoreFormat {
    'last-map-path': string;
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
