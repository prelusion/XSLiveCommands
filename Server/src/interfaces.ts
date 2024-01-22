export type Commands = Record<string, Command>;
export interface Command {
    funcName: string;
    params: Array<string | number | boolean>;
}

export interface ClientEvent {
    funcName: string;
    params: Array<string | number | boolean>;
    executeCycleNumber: number;
}

export interface RoomPlayer {
    id: string,  /* Steam ID / MS store ID */
    name: string,  /* Steam name / MS store name / Unauthenticated name */

    authenticated?: boolean, /* unused (for now?) */
}

export type PlayerConnections = Record<string /* Socket ID */ , RoomPlayer>

interface CoreRoom {
    id: string;
    host: string;  /* Socket ID */
    map: string;
    commands: Commands;
    events: Array<ClientEvent>;
    connections: PlayerConnections;
}

export interface Room extends CoreRoom {
    tyrants: Array<string>;  /* Socket IDs */
    password: string | null;
    last_execution_cycle: number;
    current_cycle: number;
}
