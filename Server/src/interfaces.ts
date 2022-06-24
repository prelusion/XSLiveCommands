export interface ServerEvent {
    commandId: number;
    params: number[];
    password: string,
    // inGameTime?: number
}

export interface ClientEvent {
    commandId: number;
    params: number[];
    executeCycleNumber: number
}

interface CoreRoom {
    id: string;
    host: string;
    scenario: string;
}

export interface Room extends CoreRoom{
    connections: string[];
    password: string | null;
    last_execution_cycle: number;
    current_cycle: number;
}

export interface RoomMessage extends CoreRoom{
    numberOfConnections: number;
}
