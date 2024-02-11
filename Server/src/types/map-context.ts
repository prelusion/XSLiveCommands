/* ⚠️ COPIED TO Client/src/renderer/src/types/map-context.ts ⚠️ - Symlinks don't work yet */
import {Commands, ScheduledCommand} from "./command";

export interface MapContext {
    /** The selected map of the room */
    name: string;
    /** The commands belonging to the map */
    commands: Commands;
    /** The events that have happened on the current map */
    events: Array<ScheduledCommand>

    /** The last scheduled execution cycle */
    last_execution_cycle: number;
    /** The current execution cycle */
    current_cycle: number;
}