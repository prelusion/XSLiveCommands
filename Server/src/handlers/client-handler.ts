import {RoomHandler} from "./room-handler";
import {Server} from "socket.io";

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

        socket.on('disconnecting', (reason) => {
            connectionAmount--;
            console.log("Client disconnected");
            console.log("id", Array.from(socket.rooms)[1])
            console.log(`Amount of connected clients are: ${connectionAmount}`);

            RoomHandler.instance.leaveRoom(Array.from(socket.rooms)[1], socket.id);
        });

        socket.on('createRoom', (scenario, callback) => {
            const id = Date.now().toString();

            if(!io.sockets.adapter.rooms.get(id)) {
                console.log("A room under the name " + scenario + " is created!");
            }

            socket.join(id);
            console.log("create", socket.rooms);
            RoomHandler.instance.createRoom(id.toString(), socket.id, scenario);
            callback(RoomHandler.instance.getRoomByID(id.toString()));
        });

        socket.on('joinRoom', (id, callback) => {
            console.log("testtest")
            if(RoomHandler.instance.getRoomByID(id) === undefined) {
                console.log("There is no room with this id");
                return callback(null);
            }

            socket.join(id);
            console.log("join", socket.rooms);
            RoomHandler.instance.joinRoom(id.toString(), socket.id)
            callback(RoomHandler.instance.getRoomByID(id.toString()));
        });
    });
}
