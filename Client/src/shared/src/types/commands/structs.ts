/* ⚠️ COPIED FROM Server/src/types ⚠️ - Symlinks don't work yet */

export type MapName = string;
export type MapPath = string;
export type CommandName = string;

interface NumberParamStruct {
    name: string,
    type: "int" | "float",
    default?: number,
}

interface StringParamStruct {
    name: string,
    type: "string",
    default?: string,
}

interface BoolParamStruct {
    name: string,
    type: "bool",
    default?: boolean,
}

export type ParamStruct = NumberParamStruct | StringParamStruct | BoolParamStruct

export interface CommandStruct {
    function: string,
    params: Array<ParamStruct>,
    name: string,
    templates?: Record<string, Array<ParamStruct>>
}

export type CommandFileStruct = Array<CommandStruct>
export type MapCommands = Record<CommandName, CommandStruct>
