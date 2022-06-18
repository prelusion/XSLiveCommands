import {eventHandler, paths, resetState, setRoom, startCoreInterval} from "./index";
import {io} from "socket.io-client";
import {Room} from "./interfaces";

export const socket = io("ws://localhost:80");
let interval: NodeJS.Timer = null;

export function startSocketClient() {
    socket.on("event", (event) => {
        console.log("test")
        console.log(event)
        eventHandler.enqueue(event)
    });

    socket.on("connect", () => {
     ///
    });

    socket.on("disconnect", () => {
        clearInterval(interval);
    });

    socket.on("start", async (scenarioFileName) => {
        paths.scenarioFile = scenarioFileName;
        await resetState();
    });

    socket.on("resetState", async () => {
        await resetState();
    });
}

export function cycleUpdate(roomId = "", cycle: number) {
    socket.emit("cycleUpdate", roomId, cycle);
}

export function joinRoom(id: string) {
    socket.emit('joinRoom', id, async (response: Room) => {
        // Gets a Room object back, make sure to save the scenario name in the paths....
        // Start core interval?
        console.log("Joined room ", response);
        setRoom(response);

        if (response.scenario  !== "") {
            await resetState();
            interval = startCoreInterval();
            console.log("The number of connections in your room are " + response.connections.length)
            console.log(response.scenario)
            paths.scenarioFile = response.scenario;
        }
    });
}

export function createRoom(scenario: string) {
    socket.emit('createRoom', scenario, async (response: Room) => {
        // Gets a Room object back, make sure to save the scenario name in the paths....
        // Start core interval?
        console.log("Created room ", response);
        setRoom(response);

        if (response.scenario  !== "") {
            await resetState();
            interval = startCoreInterval();
            console.log("The number of connections in your room are " + response.connections.length)
            paths.scenarioFile = response.scenario;
        }
    });
}

export function disconnectRoom(id: string) {
    socket.emit('disconnect', id, async (response: Room) => {
        // If response === what you expect
        console.log("Disconnected from room with response ", response)
        await resetState();
    });
}
