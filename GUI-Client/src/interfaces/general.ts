import {Commands} from "./command";

export interface Room {
    id: string;
    host: string;
    scenario: string;
    numberOfConnections: number;
    commands: Commands;
    events: CommandEvent[];
}

export interface CommandEvent {
    commandId: number;
    params: number[];
    executeCycleNumber: number;
}
