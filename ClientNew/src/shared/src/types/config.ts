export interface ConfigCoreStruct {
    'version': number;
}

export interface ConfigStructV01 extends ConfigCoreStruct {
    'last-map-path': string;
    'custom-server-hostport': string;
}

export type ConfigStruct = ConfigStructV01 /* to be union-ed with more versions */

/**
 * The latest config file format to work with
 */
export type ConfigStructLatest = ConfigStructV01;
