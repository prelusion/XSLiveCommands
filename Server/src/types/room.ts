import {PlayerConnections} from "./player";
import {ClientEvent} from "./client_event";
import {Commands} from "./command";


interface BaseRoom {
    /** The room ID */
    id: string;
    /** The socket ID of the host of the room */
    host: string;  /* Socket ID */

    // Todo: Move `commands` and `events` into an interface together with the map name
    /** The selected map of the room */
    map: string;
    /** The commands belonging to the map */
    commands: Commands;  // Todo: Move (See above)
    /** The events that have happened on the current map */
    events: Array<ClientEvent>;  // Todo: Move (See above)
    /** The players that have connected */
    connections: PlayerConnections;
}

export interface Room extends BaseRoom {
    // Todo: Move tyrant permission into `Player` interface
    /** The players that have tyrant permissions */
    tyrants: Array<string>;  /* Socket IDs */
    // Todo: Rename to represent password for tyrant permissions
    /** The tyrant password */
    password: string | null;

    /** The last scheduled execution cycle */
    last_execution_cycle: number;
    /** The current execution cycle */
    current_cycle: number;
}
