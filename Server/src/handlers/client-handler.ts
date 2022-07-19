import {Server, Socket} from "socket.io";
import {Command, Commands, RoomMessage} from "../interfaces";
import {toRoomMessage} from "../scripts/rooms";
import {RoomHandler} from "./room-handler";

function roomIdFromSocket(socket: Socket): string {
    return Array.from(socket.rooms)[1];
}

type joinCallback = (room: RoomMessage | null, error: string | null) => void;

export function startIoServer(io: Server) {
    let connectionAmount = 0;
    RoomHandler.instance.registerIo(io);

    io.on("connection", (socket: Socket) => {
        connectionAmount++;
        console.log("Client connected!");
        console.log(`Amount of connected clients are: ${connectionAmount}`);

        socket.on("cycleUpdate", (cycle: number) => {
            const roomId = roomIdFromSocket(socket);

            console.log(roomId + " cycle: " + cycle);

            if (cycle === null || cycle === undefined) {
                cycle = 0;
            }
            RoomHandler.instance.setRoomCurrentCycle(roomId, cycle);
        });

        socket.on("disconnecting", () => {
            connectionAmount--;

            console.log("Client disconnecting!");
            console.log(`Amount of connected clients are: ${connectionAmount}`);

            RoomHandler.instance.leaveRoom(roomIdFromSocket(socket), socket);
        });

        socket.on("createRoom", (scenario: string, commands: Commands, password: string | null = null, callback) => {
            const roomId = Date.now().toString();
            const room = RoomHandler.instance.createRoom(roomId, socket, scenario, commands, password);

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
                return callback();

            RoomHandler.instance.leaveRoom(roomId, socket);

            if (callback) {
                return callback();
            }
        });

        socket.on("registerCommand", (command: Command) => {
            const roomId = roomIdFromSocket(socket);
            if (roomId === undefined)
                return;

            const room = RoomHandler.instance.getRoomByID(roomId);
            // If socket is not in the tyrants list and socket is not the host, don't allow command
            if (!(room.tyrants.includes(socket.id) || room.host === socket.id))
                return;

            RoomHandler.instance.sendRoomNewCommand(roomId, command);
        })
    });
}
