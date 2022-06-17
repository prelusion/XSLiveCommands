import {eventHandler, paths, resetState, startCoreInterval} from "./index";
import {io} from "socket.io-client";
import {Room} from "./interfaces";

export const socket = io("ws://localhost:3000");
let interval: NodeJS.Timer = null;

export function startSocketClient() {
    socket.on("event", (event) => {
        console.log(event)
        eventHandler.enqueue(event)
    });

    socket.on("connect", () => {

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


    socket.on("resetState", async () => {
        await resetState();
    });
}

export function cycleUpdate(cycle: number) {
    socket.emit("cycleUpdate", cycle);
}

export function joinRoom(id: string) {
    socket.emit('joinRoom', id, (response: Room) => {
        // Gets a Room object back, make sure to save the scenario name in the paths....
        // Start core interval?
        console.log("Joined room ", response);
        if (response.scenario  !== "") {
            interval = startCoreInterval();
            console.log("The number of connections in your room are " + response.connections.length)
            paths.scenarioFile = response.scenario;
        }
    });
}

export function createRoom(scenario: string) {
    socket.emit('createRoom', scenario, (response: Room) => {
        // Gets a Room object back, make sure to save the scenario name in the paths....
        // Start core interval?
        console.log("Created room ", response);
        if (response.scenario  !== "") {
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
