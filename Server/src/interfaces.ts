export interface ServerEvent {
    commandId: number;
    params: Array<number>;
    password: string,
    // inGameTime?: number
}

export interface ClientEvent {
    funcName: string;
    params: Array<string | number | boolean>;
    executeCycleNumber: number;
}

export type Commands = Record<string, Command>;

interface CoreRoom {
    id: string;
    host: string;
    map: string;
    commands: Commands;
    events: Array<ClientEvent>;
}

export interface Room extends CoreRoom {
    connections: Array<string>;
    tyrants: Array<string>;
    password: string | null;
    last_execution_cycle: number;
    current_cycle: number;
}

export interface RoomMessage extends CoreRoom {
    numberOfConnections: number;
}

export interface Command {
    funcName: string;
    params: Array<string | number | boolean>;
}