import {io, Socket} from "socket.io-client";
import {ServerEvent, UserAction} from "../../shared/src/types/actions";
import {Param, UnscheduledCommand} from "../../shared/src/types/commands/scheduled";
import {MapCommands} from "../../shared/src/types/commands/structs";
import {Result} from "../../shared/src/types/result";
import {IRoom, Room} from "../../shared/src/types/room";
import {AuthenticatedUser, PlatformUser} from "../../shared/src/types/user";
import {Compatibility, XSLC_LATEST, XSLCVersion} from "../../shared/src/types/version";
import {ensure} from "../../shared/src/util/general";


import {CoreLoop} from "./core-loop";


export class UserServerAction {
    public static skt: Socket;
    public static connected: boolean = false;
    public static platform: PlatformUser | null = null;

    public static room: Room | null = null;
    public static currentLocalTick: number = -1;
    public static username: string | null = null;

    private static roomUpdateCallbacks: Set<(room: Room | null) => void> = new Set();
    private static connectionChangedCallback: () => void;

    private static emit<T>(action: UserAction, ...args: unknown[]): Promise<T> {
        return new Promise(resolve => this.skt.emit(action, ...args, resolve))
    }

    public static async setPlatform(): Promise<void> {
        let userId: string | null = await window.registry.getSteamId();
        if(userId) {
            this.platform = {userId, type: 'steam'};
        }
        // todo: MS Store
    }

    public static async connect(serverCustom: string | null, connectionChangedCallback: () => Promise<void>): Promise<void> {
        if(serverCustom === "") {
            serverCustom = null;
        }
        const serverEnv = await window.manager.getEnvVar('SERVER_URL');
        const serverSE = 'https://xssync.aoe2.se/';

        this.connectionChangedCallback = connectionChangedCallback;

        const serverUrl = serverCustom ?? serverEnv ?? serverSE;
        console.log(`Trying to connect to XSLC server on '${serverUrl}'`);

        this.skt = io(serverUrl);
        this.skt.on(UserAction.EstablishConnection, async () => {
            console.log(`Connected to XSLC server on '${serverUrl}'`);

            this.connected = true;
            this.username = await this.getUsername();
            connectionChangedCallback().then();

            let exists = await this.doesRoomExist();
            if(!exists) {
                this.room = null;
                this.currentLocalTick = -1;
                this.invokeRoomUpdateCallbacks();
            } else {
                await this.joinRoom(ensure(this.room).id);
            }
        })
        this.skt.on(UserAction.LoseConnection, this.disconnect.bind(this));
        this.skt.on(ServerEvent.RoomUpdate, this.updateRoom.bind(this));
    }

    public static async checkVersion(): Promise<Compatibility> {
        let {
            major,
            minor,
            patch,
            type,
            count,
            build
        }: XSLCVersion = await this.emit(UserAction.GetVersion);
        console.log(`Connected to server v${major}.${minor}.${patch}-${type}.${count}${build}`);
        if(
            major != XSLC_LATEST.major
            || minor != XSLC_LATEST.minor
            || patch != XSLC_LATEST.patch
            || type  != XSLC_LATEST.type
            || count != XSLC_LATEST.count
        ) {
            return Compatibility.Incompatible
        }

        if(build > XSLC_LATEST.build) {
            // todo: This is probably not accurate, but this condition can be changed in the future
            return Compatibility.Outdated;
        }

        return Compatibility.Compatible;
    }

    public static onRoomUpdate(fn: (room: Room | null) => void) {
        this.roomUpdateCallbacks.add(fn);
    }

    public static offRoomUpdate(fn: (room: Room | null) => void) {
        this.roomUpdateCallbacks.delete(fn);
    }

    private static updateRoom(room: IRoom) {
        if(this.room && this.room.id !== room.id) {
            throw new Error(`client room '${this.room.id}' disagrees with server '${room.id}'`);
        }
        this.room = Room.from(room);
        this.invokeRoomUpdateCallbacks();
    }

    private static invokeRoomUpdateCallbacks() {
        for(const callback of this.roomUpdateCallbacks) {
            callback(this.room);
        }
    }

    public static async disconnect(): Promise<void> {
        this.connected = false;
        this.username = null;
        this.connectionChangedCallback();
        await CoreLoop.stop();
    }

    public static updateTick(tick: number) {
        this.skt.emit(UserAction.UpdateTick, tick);
    }

    public static async doesRoomExist(): Promise<boolean> {
        if(this.room === null) {
            return false;
        }

        return await this.emit(UserAction.VerifyRoom, this.room.id)
    }

    public static async createRoom(filename: string, commands: MapCommands, password: string = ""): Promise<void> {
        const result: Result<IRoom> = await this.emit(UserAction.CreateRoom, filename, commands, password);
        if(result.isError) {
            throw new Error(result.error);
        }

        this.room = Room.from(result.value);
        await CoreLoop.start();
    }

    public static async joinRoom(roomId: string): Promise<void> {
        // todo: start loop
        const result: Result<IRoom> = await this.emit(UserAction.JoinRoom, roomId);
        if(result.isError) {
            throw new Error(result.error);
        }

        this.room = Room.from(result.value);
        await CoreLoop.start();
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
        await CoreLoop.stop();
        this.room = null;
        this.currentLocalTick = -1;
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

    public static async getTickPrediction(): Promise<number> {
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
