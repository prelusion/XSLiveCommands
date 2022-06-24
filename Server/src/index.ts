import {config} from "dotenv";
import {createServer} from "http";
import {Server} from "socket.io";

import {startIoServer} from "./handlers/client-handler";

// Load .env file
config();

export const EXECUTE_CYCLE_OFFSET = parseInt(process.env.EXECUTE_CYCLE_OFFSET) || 3;

function main() {
    const port = (process.env.PORT || 80) as number;

    const httpServer = createServer();
    const io = new Server(httpServer, {});
    io.listen(port);

    startIoServer(io);
}

main();
