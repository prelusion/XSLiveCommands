import {Server, Socket} from "socket.io";
import {RoomHandler} from "./room-handler";
import {SteamPlayerSummaryResponse} from "../types/steam";
import {Room} from "../types/room";
import {Command, Commands} from "../types/command";
import {Player, PlayerId, UnauthenticatedPlayer} from "../types/player";

function roomIdFromSocket(socket: Socket): string {
    return Array.from(socket.rooms)[1];
}

type joinCallback = (room: Room | null, error: string | null) => void;

export function startIoServer(io: Server) {
    const connections: Record<string, Player|UnauthenticatedPlayer> = {};

    RoomHandler.instance.registerIo(io);

    function error(callback: joinCallback | null, error: string): void {
        if (callback)
            callback(null, error);
    }

    io.on("connection", (socket: Socket) => {
        connections[socket.id] = { authenticated: false };

        const connectionCount = Object.keys(connections).length;
        console.log(`[Server] >> Client connected.    Active connections: ${connectionCount}`);

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
            /* Clear array when players disconnect */
            if (socket.id in connections) {
                delete connections[socket.id];
            }

            const connectionCount = Object.keys(connections).length;

            console.log(`[Server] >> Client disconnected. Active connections: ${connectionCount}`);
            RoomHandler.instance.leaveRoom(roomIdFromSocket(socket), socket);
        });

        socket.on("createRoom", (map: string, commands: Commands, password: string | null = null, callback: (room: Room) => void) => {
            const roomId = Date.now().toString();

            const player = connections[socket.id];
            if (!player.authenticated) {
                return error(callback, `[Unauthenticated] Unable to create room`);
            }

            const room = RoomHandler.instance.createRoom(roomId, player,socket, map, commands, password);

            if (callback) {
                return callback(room);
            }
        });

        socket.on("joinRoom", (roomId: string, callback: joinCallback) => {
            const room = RoomHandler.instance.getRoomByID(roomId);
            if (room === undefined) {
                return error(callback, `Room '${roomId}' does not exist`);
            }

            const player = connections[socket.id];
            if (!player.authenticated) {
                return error(callback, `[Unauthenticated] Unable to join room`);
            }

            RoomHandler.instance.joinRoom(roomId, player, socket);

            if (callback) {
                return callback(room,null);
            }
        });

        socket.on("becomeTyrant", (roomId: string, password: string, callback: joinCallback) => {
                const room = RoomHandler.instance.getRoomByID(roomId);
                if (room === undefined) {
                    return error(callback, `Could not find room with id '${roomId}'`);
                }
                if (room.password !== password) {
                    return error(callback, `Incorrect launch code`);
                }
                RoomHandler.instance.becomeTyrant(roomId, socket);

                if (callback) {
                    return callback(room, null);
                }
            },
        );

        socket.on("loseTyrant", (roomId: string, callback: joinCallback) => {
                const room = RoomHandler.instance.getRoomByID(roomId);
                if (room === undefined) {
                    return error(callback, `Could not find room with id '${roomId}'`);
                }
                RoomHandler.instance.loseTyrant(roomId, socket);

                if (callback) {
                    return callback(room, null);
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

        socket.on("executionCyclePrediction", (callback: (cycle: number) => void): void => {
            const roomId = roomIdFromSocket(socket);
            if (roomId === undefined || !callback)
                return;

            const c = RoomHandler.instance.getExecutionCycleForNewCommand(roomId);
            callback(c);
        });

        socket.on("retrieveSteamUsername", async (steamId: string, callback: (player: Player) => void): Promise<void> => {
            const baseUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?`;
            const params = new URLSearchParams({
                key: process.env.STEAM_DEVELOPER_API_KEY,
                steamids: steamId,
            });

            const id: PlayerId = {
                value: steamId,
                platform: 'steam',
            }
            let name: string,
                resolved: boolean;

            try {
                const response = await fetch(baseUrl + params);
                const data = await response.json() as SteamPlayerSummaryResponse;

                const profile = data.response.players[0];

                name = profile.personaname;
                resolved = true;
                console.log(`[Server] >> Client name resolved: ${name}       [${id.value} on ${id.platform}].`);
            } catch (e) {
                /* If name retrieval fails, fall back on the Steam ID */
                name = steamId;
                resolved = false;
                console.log(`[Server] >> Unable to resolve client name.      [${id.value} on ${id.platform}].`);
            }

            const player: Player = {
                id,
                name,
                resolved,
                authenticated: true
            };

            connections[socket.id] = player;


            callback(player);
        });
    });
}
