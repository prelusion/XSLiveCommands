import {RoomHandler} from "./room-handler";
import {Server} from "socket.io";
import {Room, RoomMessage} from "../interfaces";
import {toRoomMessage} from "../scripts/rooms";

export function startIOServer(io: Server) {
    //Todo rooms https://socket.io/docs/v3/rooms/
    let connectionAmount = 0;

    io.on('connection', (socket) => {
        connectionAmount++;
        console.log("Client connected!");
        console.log(`Amount of connected clients are: ${connectionAmount}`);

        socket.on('cycleUpdate', (roomId: string, cycle: number) => {
            if (roomId === "") {
                console.log("No room ID given")
                return;
            }
            console.log(roomId + " cycle: " + cycle)

            if (cycle === null || cycle === undefined) {
                cycle = 0;
            }
            RoomHandler.instance.getRoomByID(roomId).current_cycle = cycle;
        });

        socket.on('disconnecting', () => {
            connectionAmount--;
            console.log("Client disconnected");
            console.log("id", Array.from(socket.rooms)[1])
            console.log(`Amount of connected clients are: ${connectionAmount}`);

            RoomHandler.instance.leaveRoom(Array.from(socket.rooms)[1], socket.id);
        });

        socket.on('createRoom', (scenario, callback) => {
            const roomId = Date.now().toString();
            console.log(typeof roomId)

            if(!io.sockets.adapter.rooms.get(roomId)) {
                console.log("A room under the name " + scenario + " is created!");
            }

            socket.join(roomId);
            console.log("create", socket.rooms);
            const room = RoomHandler.instance.createRoom(roomId, socket.id, scenario);
            if (callback) {
                return callback(toRoomMessage(room));
            }
        });

        socket.on('joinRoom', (roomId: string, callback: (room: RoomMessage | null) => void) => {
            console.log(typeof roomId)
            console.log(`Join request with id: '${roomId}'`)
            const room = RoomHandler.instance.getRoomByID(roomId);
            if(room === undefined) {
                console.log("There is no room with this roomId");
                if (callback)
                    callback(null);
                return;
            }

            console.log(room)
            socket.join(roomId);
            console.log("join", socket.rooms);
            RoomHandler.instance.joinRoom(roomId, socket.id);
            io.to(roomId).emit("room-connection-update", room.connections.length);

            if (callback) {
                return callback(toRoomMessage(room));
            }
        });

        socket.on('leaveRoom', (callback: (() => void) | null) => {
            // Rooms automatically get deleted if everyone has left, so no special teardown needed
            const roomId = Array.from(socket.rooms)[1];
            if (roomId === undefined)
                return callback();

            const rh = RoomHandler.instance;
            const room = rh.getRoomByID(roomId);

            console.log("User left room...");

            socket.leave(roomId);
            rh.leaveRoom(roomId, socket.id);

            io.to(roomId).emit("room-connection-update", room.connections.length);
            console.log("room-connection-update", roomId, room.connections.length);

            if (callback) {
                return callback();
            }
        });
    });
}
