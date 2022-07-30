import {CommandTemplates} from "./command";

export interface Room {
    id: string;
    host: string;
    scenario: string;
    numberOfConnections: number;
    commands: CommandTemplates;
    events: Array<CommandEvent>;
}

export interface CommandEvent {
    commandId: number;
    params: Array<number>;
    executeCycleNumber: number;
}
