import {CommandStruct} from "./command";

export interface Room {
    id: string;
    host: string;
    scenario: string;
    numberOfConnections: number;
    commands: Array<CommandStruct>;
}

export interface CommandEvent {
    commandId: number;
    params: number[];
    executeCycleNumber: number;
}