export interface Command {
    id: number;
    params: string[];
}

export interface CommandData {
    roomId: string,
    commandId: number;
    params: {
        [name: string]: number
    };
}

export type Commands = Record<string, Command>;