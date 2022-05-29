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
