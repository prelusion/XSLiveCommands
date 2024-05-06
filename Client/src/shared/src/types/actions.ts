/* ⚠️ COPIED FROM Server/src/types ⚠️ - Symlinks don't work yet */

import type {Room} from "./room";

export enum ServerEvent {
    RoomUpdate = "room-connection-update",
}

export enum UserAction {
    NewConnection = "connection",
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

export type Result<T> = {isError: false, value: T} | {isError: true, error: string}

export function ok<T>(value: T): Result<T> {
    return {value, isError: false};
}
export function err<T>(error: string): Result<T> {
    return {error, isError: true};
}

export type ResultCallback = (result: Result<Room>) => void;