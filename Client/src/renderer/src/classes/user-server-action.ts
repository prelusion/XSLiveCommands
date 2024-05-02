import {io, Socket} from "socket.io-client";


import {Result, ServerEvent, UserAction} from "../../../shared/src/types/actions";
import {AuthenticatedUser, PlatformUser} from "../../../shared/src/types/user";
import {IRoom, Room} from "../../../shared/src/types/room";
import {Param, UnscheduledCommand} from "../../../shared/src/types/commands/scheduled";
import {MapCommands} from "../../../shared/src/types/commands/structs";
import {RwCoreLoop} from "./rw-loop";

export class UserServerAction {
    public static skt: Socket;
    public static connected: boolean = false;
    public static platform: PlatformUser | null = null;

    public static room: Room | null = null;
    public static username: string | null = null;

    private static emit<T>(action: UserAction, ...args): Promise<T> {
        return new Promise(resolve => this.skt.emit(action, ...args, resolve))
    }

    public static async setPlatform(): Promise<void> {
        let userId: string | null = await window.registry.getSteamId();
        if(userId) {
            this.platform = {userId, type: 'steam'};
        }
        // todo: MS Store
    }

    public static async connect(serverCustom: string | null, fn: () => void): Promise<void> {
        if(serverCustom === "") {
            serverCustom = null;
        }
        const serverEnv = await window.manager.getEnvVar('SERVER_URL') as (string | null);
        const serverSE = 'https://xssync.aoe2.se/';

        this.skt = io(serverCustom ?? serverEnv ?? serverSE);
        this.skt.on(UserAction.EstablishConnection, async () => {
            this.connected = true;
            fn();
            this.username = await this.getUsername();
            fn();
            let exists = await this.doesRoomExist();
            if(!exists) {
                this.room = null;
            }
            this.skt.on(UserAction.LoseConnection, this.disconnect.bind(this));
            this.skt.on(ServerEvent.RoomUpdate, this.updateRoom.bind(this));
        })
    }

    private static updateRoom(room: IRoom) {
        if(this.room?.id !== room.id) {
            throw new Error("Unreachable");
        }
        this.room = Room.from(room);
    }

    public static disconnect(): void {
        this.connected = false;
        this.username = null;
        this.skt.disconnect();
    }

    public static updateTick(tick: number) {
        this.skt.emit(UserAction.UpdateTick, tick);
    }

    public static async doesRoomExist(): Promise<boolean> {
        if(this.room === null) {
            return false;
        }

        return await this.emit(UserAction.VerifyRoom, this.room!.id)
    }

    public static async createRoom(filename: string, commands: MapCommands, password: string = ""): Promise<void> {
        const result: Result<IRoom> = await this.emit(UserAction.CreateRoom, filename, commands, password);
        if(result.isError) {
            throw new Error(result.error);
        }

        this.room = Room.from(result.value);
        await RwCoreLoop.startCoreLoop();
    }

    public static async joinRoom(roomId: string): Promise<Room> {
        // todo: start loop
        const result: Result<IRoom> = await this.emit(UserAction.JoinRoom, roomId);
        if(result.isError) {
            throw new Error(result.error);
        }

        this.room = Room.from(result.value);
        await RwCoreLoop.startCoreLoop();

        return this.room;
    }

    public static async leaveRoom(): Promise<void> {
        // todo: end loop
        if(this.room === null) {
            throw new Error("Cannot leave room whilst not in a room");
        }

        const result: Result<IRoom> = await this.emit(UserAction.LeaveRoom);
        if(result.isError) {
            throw new Error(result.error);
        }
        await RwCoreLoop.stopCoreLoop();
        this.room = null;
    }

    public static async joinTyrant(password: string): Promise<void> {
        if(this.room === null) {
            throw new Error("Cannot join as tyrant whilst not in a room");
        }
        const result: Result<IRoom> = await this.emit(UserAction.JoinTyrant, password);
        if(result.isError) {
            throw new Error(result.error);
        }
    }

    public static async leaveTyrant(): Promise<void> {
        if(this.room === null) {
            throw new Error("Cannot leave tyrant whilst not in a room");
        }
        const result: Result<IRoom> = await this.emit(UserAction.LeaveTyrant);
        if(result.isError) {
            throw new Error(result.error);
        }
    }

    public static async issueCommand(functionName: string, params: Array<Param>): Promise<void> {
        const command: UnscheduledCommand = {
            function: functionName,
            params: params,
            isScheduled: false,
        }
        if(this.room === null) {
            throw new Error("Cannot issue command whilst not in a room");
        }
        const result: Result<IRoom> = await this.emit(UserAction.IssueCommand, command);
        if(result.isError) {
            throw new Error(result.error);
        }
    }

    public static async getTickPrediciton(): Promise<number> {
        if(this.room === null) {
            throw new Error("Cannot get tick prediction whilst not in a room");
        }
        const result: Result<number> = await this.emit(UserAction.TickPrediction);
        if(result.isError) {
            throw new Error(result.error);
        }
        return result.value;
    }

    private static async getUsername(): Promise<string | null> {
        if (this.platform?.type !== "steam") {
            return null; // todo: MS Store
        }
        const user: AuthenticatedUser = await this.emit(UserAction.SteamUsername, this.platform.userId);
        if(user.resolved) {
            return user.name;
        }
        return null;
    }
}