/* ⚠️ COPIED FROM Server/src/types/room.ts ⚠️ - Symlinks don't work yet */

import {RoomPlayer, SocketId} from "./player";
import {MapContext} from "./map-context";

export interface Room {
    /** The room ID */
    id: string;
    /** The socket ID of the host of the room */
    host: SocketId;
    /** The selected map and all information of the current match */
    map: MapContext | null;
    /** The players that have connected */
    connections: Record<SocketId, RoomPlayer>;
    /** The tyrant password */
    tyrantPassword: string | null;
}