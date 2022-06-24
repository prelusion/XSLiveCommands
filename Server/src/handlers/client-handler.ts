import {RoomHandler} from "./room-handler";
import {Server, Socket} from "socket.io";
import {RoomMessage} from "../interfaces";
import {toRoomMessage} from "../scripts/rooms";

function roomIdFromSocket(socket: Socket): string {
    return Array.from(socket.rooms)[1];
}

export function startIOServer(io: Server) {
    let connectionAmount = 0;
    RoomHandler.instance.registerIo(io);

    io.on('connection', (socket: Socket) => {
        connectionAmount++;
        console.log("Client connected!");
        console.log(`Amount of connected clients are: ${connectionAmount}`);

        socket.on('cycleUpdate', (cycle: number) => {
            const roomId = roomIdFromSocket(socket);

            console.log(roomId + " cycle: " + cycle)

            if (cycle === null || cycle === undefined) {
                cycle = 0;
            }
            RoomHandler.instance.setRoomCurrentCycle(roomId, cycle);
        });

        socket.on('disconnecting', () => {
            connectionAmount--;

            console.log("Client disconnecting!");
            console.log(`Amount of connected clients are: ${connectionAmount}`);

            RoomHandler.instance.leaveRoom(roomIdFromSocket(socket), socket);
        });

        socket.on('createRoom', (scenario: string, password: string | null = null, callback) => {
            const roomId = Date.now().toString();
            const room = RoomHandler.instance.createRoom(roomId, socket, scenario, password);

            console.log(room)

            if (callback) {
                return callback(toRoomMessage(room));
            }
        });

        socket.on('joinRoom', (roomId: string, callback: (room: RoomMessage | null) => void) => {
            const room = RoomHandler.instance.getRoomByID(roomId);
            if(room === undefined) {
                return callback ? callback(null) : null;
            }

            RoomHandler.instance.joinRoom(roomId, socket);

            if (callback) {
                return callback(toRoomMessage(room));
            }
        });

        socket.on('leaveRoom', (callback: (() => void) | null) => {
            const roomId = roomIdFromSocket(socket);
            if (roomId === undefined)
                return callback();

            RoomHandler.instance.leaveRoom(roomId, socket);

            if (callback) {
                return callback();
            }
        });
    });
}
