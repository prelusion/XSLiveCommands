/* ⚠️ COPIED FROM Server/src/types ⚠️ - Symlinks don't work yet */

import {MapCommands} from "./commands/structs";
import {ScheduledCommand} from "./commands/scheduled";

export interface MapContext {
    /** The selected map of the room */
    name: string;
    /** The commands belonging to the map */
    commands: MapCommands;
    /** The events that have happened on the current map */
    events: Array<ScheduledCommand>
    /** The last scheduled execution cycle */
    lastExecTick: number;
    /** The current execution cycle */
    currentTick: number;
}