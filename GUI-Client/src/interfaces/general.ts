import {CommandEvent, CommandTemplates} from "./command";

export interface Room {
    id: string;
    host: string;
    scenario: string;
    numberOfConnections: number;
    commands: CommandTemplates;
    events: Array<CommandEvent>;
}

