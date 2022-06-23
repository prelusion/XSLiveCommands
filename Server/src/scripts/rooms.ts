import {Room, RoomMessage} from "../interfaces";

export function toRoomMessage(room: Room): RoomMessage {
    return {
        id: room.id,
        host: room.host,
        scenario: room.scenario,
        numberOfConnections: room.connections.length,
    }
}