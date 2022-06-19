
export interface Room {
    id: string;
    host: string;
    scenario: string;
    connections: string[];
}

export interface CommandEvent {
    commandId: number;
    params: number[];
    executeCycleNumber: number;
}