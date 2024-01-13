import {Commands, Room, RoomMessage} from "../interfaces";

export function toRoomMessage(room: Room): RoomMessage {
    return {
        id: room.id,
        host: room.host,
        map: room.map,
        numberOfConnections: room.connections.length,
        commands: room.commands,
        events: room.events,
    };
}

export function createRoom(
    id: string,
    host: string,
    map: string,
    commands: Commands,
    password: string,
    connections: Array<string>,
): Room {
    return {
        id: id,
        host: host,
        map: map,
        connections: connections,
        tyrants: [],
        events: [],
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