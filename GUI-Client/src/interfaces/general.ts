
export interface Room {
    id: string;
    host: string;
    scenario: string;
    numberOfConnections: number;
}

export interface CommandEvent {
    commandId: number;
    params: number[];
    executeCycleNumber: number;
}