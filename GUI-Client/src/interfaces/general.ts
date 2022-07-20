import {Commands} from "./command";

export interface Room {
    id: string;
    host: string;
    scenario: string;
    numberOfConnections: number;
    commands: Commands;
    events: Array<CommandEvent>;
}

export interface CommandEvent {
    commandId: number;
    params: Array<number>;
    executeCycleNumber: number;
}
