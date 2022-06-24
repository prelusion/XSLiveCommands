import {Room, RoomMessage} from "../interfaces";

export function toRoomMessage(room: Room): RoomMessage {
    return {
        id: room.id,
        host: room.host,
        scenario: room.scenario,
        numberOfConnections: room.connections.length,
        commands: room.commands,
    };
}

export function createRoom(id: string, host: string, scenario: string, commands: unknown, password: string, connections: Array<string>): Room {
    return {
        id, host, scenario, connections, password, commands,
        last_execution_cycle: -1,
        current_cycle: -1,
    };
}
