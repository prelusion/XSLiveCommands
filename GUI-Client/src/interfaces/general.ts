import {CommandEvent, CommandTemplates} from "./command";

export interface Room {
    id: string;
    host: string;
    scenario: string;
    numberOfConnections: number;
    commands: CommandTemplates;
    events: Array<CommandEvent>;
}

/**
 * A type for getting a union of all possible property value types
 */
export type valueof<T> = T[keyof T];
