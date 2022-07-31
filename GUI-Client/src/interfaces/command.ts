export interface CommandParamConfig {
    name: string;
    type: string;
    default?: string | number | boolean;
}

interface CommandCore {
    funcName: string;
}

// ------------------< Json >------------------ \\

// JsonCommandFile is converted to a Record<string, CommandTemplate> for ease of access

export type JsonCommandFile = Array<JsonCommand>;

export interface JsonCommand extends CommandCore {
    params: Array<CommandParamConfig>;
    name: string;
}

// ------------------< Templates >------------------ \\

export interface CommandTemplate extends CommandCore {
    params: Array<CommandParamConfig>;
}

export type CommandTemplates = Record<string, CommandTemplate>;

// ------------------< Writeable Commands >------------------ \\

export interface Command extends CommandCore {
    params: Array<Param>;
}

export interface Param {
    name: string;
    type: ParamType;
    data: string | number | boolean;
}

// ------------------< Received Commands >------------------ \\

export interface CommandEvent extends Command {
    executeCycleNumber: number;
}

// ------------------< Useful Enum >------------------ \\

export enum ParamType {
    INT,
    FLOAT,
    BOOL,
    STRING,
}