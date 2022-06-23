import {Room, RoomMessage} from "../interfaces";

export function toRoomMessage(room: Room): RoomMessage {
    return {
        id: room.id,
        host: room.host,
        scenario: room.scenario,
        numberOfConnections: room.connections.length,
    }
}

export function createRoom(id: string, host: string, scenario: string, connections: Array<string>): Room {
    return {
        id, host, scenario, connections,
        last_execution_cycle: -1,
        current_cycle: -1,
    }
}
