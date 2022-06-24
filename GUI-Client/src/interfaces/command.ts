export interface JsonCommand {
    name: string;
    id: number;
    params: number[];
}

export interface Command {
    id: number;
    params: number[];
}

export interface CommandData {
    roomId: string;
    commandId: number;
    params: {
        [name: string]: number;
    };
}

export type Commands = Record<string, Command>;