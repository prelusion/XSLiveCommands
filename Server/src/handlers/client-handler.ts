import {RoomHandler} from "./room-handler";

export function startIOServer(io) {
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

        socket.on('disconnect', (id, callback) => {
            connectionAmount--;
            console.log("Client disconnected");
            console.log("id", id)
            console.log(`Amount of connected clients are: ${connectionAmount}`);

            if (isNaN(id)) {
                return;
            }

            const roomConnects = RoomHandler.instance.getNumberOfConnections(id.toString());
            RoomHandler.instance.leaveRoom(id.toString(), socket.id);

            if (roomConnects !== RoomHandler.instance.getNumberOfConnections(id.toString())) {
                callback(null);
            } else {
                console.log("Client isn't properly disconnected!");
                callback(RoomHandler.instance.getRoomByID(id));
            }
        });

        socket.on('createRoom', (scenario, callback) => {
            const id = Date.now().toString();

            if(!io.sockets.adapter.rooms.get(id)) {
                console.log("A room under the name " + scenario + " is created!");
            }



            socket.join(id);
            RoomHandler.instance.createRoom(id.toString(), socket.id, scenario);
            callback(RoomHandler.instance.getRoomByID(id.toString()));
        });

        socket.on('joinRoom', (id, callback) => {
            // if(!io.sockets.adapter.rooms.get(id)) {
            //     console.log("There is no room with this id");
            //     callback(null);
            // }




            socket.join(id);
            RoomHandler.instance.joinRoom(id.toString(), socket.id)
            callback(RoomHandler.instance.getRoomByID(id.toString()));
        });
    });
}
