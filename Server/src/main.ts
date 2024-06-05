import {config} from "dotenv";
import {createServer} from "http";
import {Server} from "socket.io";

import {XSLCServer} from "./action-listeners/xslc-server";

config();

export const EXEC_TICK_OFFSET = parseInt(process.env.EXEC_TICK_OFFSET || '3');

function main() {
    const port = (process.env.PORT || 80) as number;

    const httpServer = createServer();
    const io = new Server(httpServer, {});
    io.listen(port);

    new XSLCServer(io);
}

main();
