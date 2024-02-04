import {Commands, Room, RoomPlayer, PlayerConnections} from "../interfaces";

export function createRoomPlayer(
    id: string,
    name: string,
): RoomPlayer {
    return {
        id: id,
        name: name,
    }
}

export function createRoomObject(
    id: string,
    host: string,
    name: string,
    map: string,
    commands: Commands,
    password: string,
): Room {
    const connections: PlayerConnections = {};
    connections[id] = {id: id, name: name};

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