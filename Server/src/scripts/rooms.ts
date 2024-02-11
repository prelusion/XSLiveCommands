import {AuthenticatedPlayer, RoomPlayer, SocketId} from "../types/player";
import {Room} from "../types/room";
import {Commands} from "../types/command";

export function createRoomObject(
    roomId: string,
    player: AuthenticatedPlayer,
    socketId: SocketId,
    map: string,
    commands: Commands,
    tyrantPassword: string,
): Room {
    const connections: Record<SocketId, RoomPlayer> = {
        socketId: {tyrant: false, ...player}
    };

    return {
        id: roomId,
        host: socketId,
        map: {
            name: map,
            commands: commands,
            events: [],
            last_execution_cycle: -1,
            current_cycle: -1,
        },
        connections: connections,
        tyrantPassword: tyrantPassword,
    };
}
