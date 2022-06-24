import {Command, Commands, Room, RoomMessage} from "../interfaces";

export function toRoomMessage(room: Room): RoomMessage {
    return {
        id: room.id,
        host: room.host,
        scenario: room.scenario,
        numberOfConnections: room.connections.length,
        commands: room.commands,
    };
}

export function createRoom(
    id: string,
    host: string,
    scenario: string,
    commands: Commands,
    password: string,
    connections: Array<string>,
): Room {
    return {
        id: id,
        host: host,
        scenario: scenario,
        connections: connections,
        tyrants: [],
        password: password,
        commands: commands,
        last_execution_cycle: -1,
        current_cycle: -1,
    };
}

export interface CommandData {
    roomId: string,
    commandId: number;
    params: {
        [name: string]: number
    };
}