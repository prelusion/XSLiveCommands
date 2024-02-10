import {CommandEvent, CommandTemplates} from "../../../shared/src/types/command";

export interface Room {
    id: string;
    host: string;
    map: string;
    // numberOfConnections: number;  /* Temporary */
    connections: Record<string, unknown>;  /* Temporary */
    commands: CommandTemplates;
    events: Array<CommandEvent>;
}

/**
 * A type for getting a union of all possible property value types
 */
export type valueof<T> = T[keyof T];
