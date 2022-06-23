export interface ServerEvent {
    commandId: number;
    params: number[];
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
    last_execution_cycle: number;
    current_cycle: number;
}

export interface RoomMessage extends CoreRoom{
    numberOfConnections: number;
}
