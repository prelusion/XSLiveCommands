export type Commands = Record<string, Command>;

export interface Command {
    function: string;
    params: Array<string | number | boolean>;
}

export interface ScheduledCommand extends Command {
    executeCycleNumber: number;
}