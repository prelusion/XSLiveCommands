import {ParamType} from "@/enums/commands";

export interface CommandParamConfig {
    name: string;
    type: string;
    default?: string | number | boolean;
}

interface CommandCore {
    funcName: string;
    params: Array<CommandParamConfig>;
}

// ------------------< Json >------------------ \\

// JsonCommandFile is converted to a Record<string, CommandTemplate> for ease of access

export type JsonCommandFile = Array<JsonCommand>;

export interface JsonCommand extends CommandCore{
    name: string;
}

// ------------------< Templates >------------------ \\

export type CommandTemplate = CommandCore
export type CommandTemplates = Record<string, CommandTemplate>;

// ------------------< Writeable Commands >------------------ \\

export interface Command {
    funcName: string;
    params: Array<Param>;
}

export interface Param {
    name: string;
    type: ParamType;
    data: string | number | boolean;
}
