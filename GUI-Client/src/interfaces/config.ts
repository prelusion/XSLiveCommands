export interface ConfigFileCoreFormat {
    'version': number;
}

export interface ConfigFileFormatV1 extends ConfigFileCoreFormat{
    'last-scenario-path': string;
    'custom-server-hostport': string;
}

/**
 * All config file formats (A little more constraint version of unknown)
 */
export type AnyConfigFileFormat = ConfigFileCoreFormat
    | ConfigFileFormatV1;