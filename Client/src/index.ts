import { io } from "socket.io-client"
import {CycleCounter} from "./cycle_counter";
import {Event_handler} from "./event_handler";
import {Event} from "./interfaces";
import {initPaths, PATH_READ_FROM, PATH_WRITE_TO} from "./paths";
import * as fs from "fs";
import {readCycle, writeEvent} from "./io";

async function main() {
    await initPaths();

    const socket = io("ws://localhost:3000")
    const cycleCounter = new CycleCounter();
    const eventHandler = new Event_handler();

    let LAST_EXECUTE_CYCLE = -1;
    let event: Event

    socket.on("event", (event) => {
        eventHandler.enqueue(event)
    });

    setInterval(async () => {
        cycleCounter.cycle = await readCycle(PATH_READ_FROM, cycleCounter.cycle)

        socket.emit("cycleUpdate", cycleCounter.cycle);

        socket.emit("start", cycleCounter.cycle)
        console.log(cycleCounter.cycle)
        if(LAST_EXECUTE_CYCLE < cycleCounter.cycle) {
            if(!eventHandler.isEmpty()) {
                event = eventHandler.dequeue();

                LAST_EXECUTE_CYCLE = event.executeCycleNumber;
                await writeEvent(PATH_WRITE_TO, event);
                console.log("NEW EVENT HAS BEEN WRITTE")
            }
        }
    }, 1000);

}

main().then();
