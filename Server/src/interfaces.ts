export interface ServerEvent {
    commandId: number;
    params: number[];
    password: string,
    // inGameTime?: number
}

export interface ClientEvent {
    commandId: number;
    params: number[];
    executeCycleNumber: number;
}

export type Commands = Record<string, Command>;

interface CoreRoom {
    id: string;
    host: string;
    scenario: string;
    commands: Commands;
    events: ClientEvent[];
}

export interface Room extends CoreRoom {
    connections: string[];
    tyrants: string[];
    password: string | null;
    last_execution_cycle: number;
    current_cycle: number;
}

export interface RoomMessage extends CoreRoom {
    numberOfConnections: number;
}

export interface Command {
    id: number;
    params: number[];
}