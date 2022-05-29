
import {EventHandler} from "./handlers/event-handler";
import {startIOServer} from "./handlers/client-handler";
import {startExpressServer} from "./handlers/source-handler";
export const eventHandler = new EventHandler();

startIOServer();
startExpressServer();

export const EXECUTE_CYCLE_OFFSET = 5;
export let CURRENT_CYCLE: number = 0;
export let LAST_EXECUTION_CYCLE = -1;


export function setCurrentCycle(cycle: number) {
    CURRENT_CYCLE = cycle;
}

export function setLastExecutionCycle(cycle: number) {
    LAST_EXECUTION_CYCLE = cycle;
}

