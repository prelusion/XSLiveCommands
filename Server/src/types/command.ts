export type Commands = Record<string, Command>;

export interface Command {
    funcName: string;
    params: Array<string | number | boolean>;
}