/* ⚠️ COPIED FROM Server/src/types/map-context.ts ⚠️ - Symlinks don't work yet */
import {CommandEvent, CommandTemplates} from "../../../shared/src/types/command";

export interface MapContext {
    /** The selected map of the room */
    name: string;
    /** The commands belonging to the map */
    commands: CommandTemplates;  /* Todo: Make these consistent with Server */
    /** The events that have happened on the current map */
    events: Array<CommandEvent>  /* Todo: Make these consistent with Server */

    /** The last scheduled execution cycle */
    last_execution_cycle: number;
    /** The current execution cycle */
    current_cycle: number;
}