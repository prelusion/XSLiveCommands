// ------------------< Json >------------------ \\

export type CommandTemplateParamConfigObject = {
    name: string;
    default?: number;
    required?: boolean;
};

export type CommandTemplateParamConfig = string | CommandTemplateParamConfigObject;

export interface JsonCommand {
    name: string;
    id: number;
    params: Array<CommandTemplateParamConfig>;
}

export type JsonCommandFile = Array<JsonCommand>;

// ------------------< Received Commands >------------------ \\

export interface CommandTemplate {
    id: number;
    params: Array<CommandTemplateParamConfig>;
}

export interface Command {
    id: number;
    params: Array<number>;
}


export type Commands = Record<string, CommandTemplate>;