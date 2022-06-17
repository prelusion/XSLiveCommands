export interface Event {
    commandId: number;
    params: number[];
    executeCycleNumber: number
}

export interface Room {
    id: string;
    host: string;
    scenario: string;
    connections: string[];
}
