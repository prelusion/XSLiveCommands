import { Server } from "socket.io";
import {setCurrentCycle} from "../index";
const io = new Server(3000);

//Todo rooms https://socket.io/docs/v3/rooms/
let connectionAmount: number = 0;

export function startIOServer() {
    io.on('connection', (socket) => {
        connectionAmount++;
        console.log("Client connected!")
        console.log(`Amount of connected clients are: ${connectionAmount}`)

        socket.on('cycleUpdate', cycle => {
            console.log(cycle)
            setCurrentCycle(cycle);
        });

        socket.on('disconnect', () => {
            connectionAmount--;
            console.log("Client disconnected")
            console.log(`Amount of connected clients are: ${connectionAmount}`)
        });
    });

}
export default io;
