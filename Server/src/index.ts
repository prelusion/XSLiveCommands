import express from "express";
import {Server} from "socket.io";

import {startExpressServer} from "./handlers/request-handler";
import {startIOServer} from "./handlers/client-handler";
import {createServer} from "http";
import {EventHandler} from "./handlers/event-handler";
export const eventHandler = new EventHandler();

export const EXECUTE_CYCLE_OFFSET = 5;

function main() {
    const port = 80;
    const app = express();
    app.set("port", port).use(express.json())

    const httpServer = createServer(app);
    const io = new Server(httpServer);

    startExpressServer(httpServer, app, io);
    startIOServer(io);
}

main();
