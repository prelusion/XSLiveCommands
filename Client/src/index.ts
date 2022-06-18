import {CycleCounter} from "./cycle_counter";
import {Event_handler} from "./event_handler";
import {Event} from "./interfaces";
import {Paths} from "./paths";
import {readCycle, deleteUsedFiles, writeEvent} from "./io";
import {createRoom, cycleUpdate, startSocketClient} from "./socket";

export const paths = new Paths();
export const cycleCounter = new CycleCounter();
export const eventHandler = new Event_handler();
let LAST_EXECUTE_CYCLE = -1;
let event: Event


export async function resetState() {
    await deleteUsedFiles(paths.PATH_READ_FROM, paths.PATH_WRITE_TO);
    LAST_EXECUTE_CYCLE = -1;
    cycleCounter.cycle = 0;
    eventHandler.emptyQueue();
}

async function main() {
    startSocketClient();
    await paths.initPaths();
    await resetState();
    createRoom("testScenario123");
}

export function startCoreInterval(interval= 1000) {
    return setInterval(async () => {
        cycleCounter.cycle = await readCycle(paths.PATH_READ_FROM, cycleCounter.cycle)

        cycleUpdate(cycleCounter.cycle);
        console.log(cycleCounter.cycle)

        if (LAST_EXECUTE_CYCLE < cycleCounter.cycle) {
            if (!eventHandler.isEmpty()) {
                event = eventHandler.dequeue();

                LAST_EXECUTE_CYCLE = event.executeCycleNumber;
                await writeEvent(paths.PATH_WRITE_TO, event);
                console.log("NEW EVENT HAS BEEN WRITTEN")
            }
        }
    }, interval);
}

main().then();
