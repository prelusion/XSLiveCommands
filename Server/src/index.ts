import express from "express";
import {Server} from "socket.io";

import {startExpressServer} from "./handlers/source-handler";
import {startIOServer} from "./handlers/client-handler";
import {createServer} from "http";
import {EventHandler} from "./handlers/event-handler";
export const eventHandler = new EventHandler();

export const EXECUTE_CYCLE_OFFSET = 5;
export let CURRENT_CYCLE = 0;
export let LAST_EXECUTION_CYCLE = -1;

function main() {
    const port = 3000;
    const app = express();
    app.set("port", port).use(express.json())

    const httpServer = createServer(app);
    const io = new Server(httpServer);

    startExpressServer(httpServer, app, io);
    startIOServer(io);
}

export function setCurrentCycle(cycle: number) {
    CURRENT_CYCLE = cycle;
}

export function setLastExecutionCycle(cycle: number) {
    LAST_EXECUTION_CYCLE = cycle;
}

main();
