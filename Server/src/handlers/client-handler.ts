import {Server, Socket} from "socket.io";
import {Command, Commands, Room, RoomMessage} from "../interfaces";
import {toRoomMessage} from "../scripts/rooms";
import {RoomHandler} from "./room-handler";
import {SteamPlayerSummeryResponse} from "../types/steam";

function roomIdFromSocket(socket: Socket): string {
    return Array.from(socket.rooms)[1];
}

type joinCallback = (room: RoomMessage | null, error: string | null) => void;

export function startIoServer(io: Server) {
    let connectionAmount = 0;
    RoomHandler.instance.registerIo(io);

    io.on("connection", (socket: Socket) => {
        connectionAmount++;
        console.log(`[Server] >> Client connected.    Active connections: ${connectionAmount}`);

        socket.on("cycleUpdate", (cycle: number) => {
            const roomId = roomIdFromSocket(socket);

            if (cycle === null || cycle === undefined) {
                cycle = 0;
            }
            RoomHandler.instance.setRoomCurrentCycle(roomId, cycle);
        });

        socket.on("verifyRoomExists", (roomId: string, callback: (b: boolean) => void) => {
            return callback(!!RoomHandler.instance.getRoomByID(roomId));
        });

        socket.on("disconnecting", () => {
            connectionAmount--;

            console.log(`[Server] >> Client disconnected. Active connections: ${connectionAmount}`);
            RoomHandler.instance.leaveRoom(roomIdFromSocket(socket), socket);
        });

        socket.on("createRoom", (map: string, commands: Commands, password: string | null = null, callback) => {
            const roomId = Date.now().toString();
            const room = RoomHandler.instance.createRoom(roomId, socket, map, commands, password);

            if (callback) {
                return callback(toRoomMessage(room));
            }
        });

        socket.on("joinRoomAsPlayer", (roomId: string, callback: joinCallback) => {
            const room = RoomHandler.instance.getRoomByID(roomId);
            if (room === undefined) {
                return callback ? callback(null, `Could not find room with id '${roomId}'`) : null;
            }

            RoomHandler.instance.joinRoom(roomId, socket);

            if (callback) {
                return callback(toRoomMessage(room),null);
            }
        });

        socket.on("joinRoomAsTyrant", (roomId: string, password: string, callback: joinCallback) => {
                const room = RoomHandler.instance.getRoomByID(roomId);
                if (room === undefined) {
                    return callback ? callback(null, `Could not find room with id '${roomId}'`) : null;
                }
                if (room.password !== password) {
                    return callback ? callback(null, `Wrong password`) : null;
                }
                RoomHandler.instance.joinRoom(roomId, socket, true);

                if (callback) {
                    return callback(toRoomMessage(room), null);
                }
            },
        );

        socket.on("leaveRoom", (callback: (() => void) | null) => {
            const roomId = roomIdFromSocket(socket);
            if (roomId === undefined)
                return callback ? callback() : null;

            RoomHandler.instance.leaveRoom(roomId, socket);

            if (callback) {
                return callback();
            }
        });

        socket.on("registerCommand", (command: Command) => {
            const roomId = roomIdFromSocket(socket);
            if (roomId === undefined)
                return;

            const room = RoomHandler.instance.getRoomByID(roomId) as Room;
            // If socket is not in the tyrants list and socket is not the host, don't allow command
            if (!(room.tyrants.includes(socket.id) || room.host === socket.id))
                return;

            RoomHandler.instance.sendRoomNewCommand(roomId, command);
        });

        socket.on("executionCyclePrediction", (callback: (number) => number) => {
            const roomId = roomIdFromSocket(socket);
            if (roomId === undefined || !callback)
                return;

            const c = RoomHandler.instance.getExecutionCycleForNewCommand(roomId);
            callback(c);
        });

        socket.on("retrieveSteamUsername", (steamId: string, callback: (data) => void): void => {
            const key = process.env.STEAM_DEVELOPER_API_KEY;

            // Create steam URL
            const baseUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?`;
            const url = baseUrl + new URLSearchParams({
                key: key,
                steamids: steamId,
            });

            fetch(url)
                .then(response => response.json())
                .then((data: SteamPlayerSummeryResponse) => {
                    const profile = data.response.players[0];

                    callback(profile.personaname);
                });
        });
    });
}
