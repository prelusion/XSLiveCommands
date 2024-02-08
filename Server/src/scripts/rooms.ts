import {Player, PlayerConnections, SocketId} from "../types/player";
import {Room} from "../types/room";
import {Commands} from "../types/command";

export function createRoomObject(
    roomId: string,
    player: Player,
    socketId: SocketId,
    map: string,
    commands: Commands,
    password: string,
): Room {
    const connections: PlayerConnections = {};

    connections[socketId] = player;

    return {
        id: roomId,
        host: socketId,
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