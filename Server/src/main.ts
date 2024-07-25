import {config} from "dotenv";
import {createServer} from "http";
import {Server} from "socket.io";

import {XSLCServer} from "./action-listeners/xslc-server";

config();

export const NEW_COMMAND_TICK_DELAY = parseInt(process.env.NEW_COMMAND_TICK_DELAY || '3');

function main() {
    const port = (process.env.PORT || 80) as number;

    const httpServer = createServer();
    const io = new Server(httpServer, {});
    io.listen(port);

    console.log(`Configured for port: ${port}`)

    new XSLCServer(io);
}

main();
