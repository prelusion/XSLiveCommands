/* ⚠️ COPIED TO Client/src/shared/src/types ⚠️ - Symlinks don't work yet */

import type {Result} from "./result";
import type {Room} from "./room";

export enum ServerEvent {
    RoomUpdate = "room-connection-update",
}

export enum UserAction {
    NewConnection = "connection",
    GetVersion = "getVersion",
    EstablishConnection = "connect",
    LoseConnection = "disconnect",
    UpdateTick = "cycleUpdate",
    VerifyRoom = "verifyRoomExists",
    Disconnect = "disconnecting",
    CreateRoom = "createRoom",
    JoinRoom = "joinRoom",
    LeaveRoom = "leaveRoom",
    JoinTyrant = "becomeTyrant",
    LeaveTyrant = "loseTyrant",
    IssueCommand = "registerCommand",
    TickPrediction = "executionCyclePrediction",
    SteamUsername = "retrieveSteamUsername",
}

export type ResultCallback = (result: Result<Room>) => void;
