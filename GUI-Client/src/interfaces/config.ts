export interface ConfigFileCoreFormat {
    'version': number;
}

export interface ConfigFileFormatV01 extends ConfigFileCoreFormat {
    'last-map-path': string;
    'custom-server-hostport': string;
}

/**
 * The newest config file format to work with
 */
export type ConfigFileFormatNewest = ConfigFileFormatV01;
