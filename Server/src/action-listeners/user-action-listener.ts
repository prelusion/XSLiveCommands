import {Socket} from "socket.io";
import type {XSLCServer} from "./xslc-server";
import {Room, RoomId} from "../types/room";
import {UserAction, JoinCallback, err, of, Result} from "../types/actions";
import {AuthenticatedUser} from "../types/user";
import {SteamPlayerSummaryResponse} from "../types/steam";
import {MapCommands} from "../types/commands/structs";
import {Command} from "../types/commands/scheduled";

export class UserActionListener {
    public userSkt: Socket
    public server: XSLCServer

    private room: Room | null

    public constructor(server: XSLCServer, userSkt: Socket) {
        this.server = server;
        this.userSkt = userSkt;

        this.userSkt.on(UserAction.UpdateTick, this.onUpdateTick.bind(this));
        this.userSkt.on(UserAction.VerifyRoom, this.doesRoomExist.bind(this));
        this.userSkt.on(UserAction.Disconnect, this.disconnect.bind(this));
        this.userSkt.on(UserAction.CreateRoom, this.createRoom.bind(this));
        this.userSkt.on(UserAction.JoinRoom, this.joinRoom.bind(this));
        this.userSkt.on(UserAction.LeaveRoom, this.leaveRoom.bind(this));
        this.userSkt.on(UserAction.JoinTyrant, this.joinTyrant.bind(this));
        this.userSkt.on(UserAction.LeaveTyrant, this.leaveTyrant.bind(this));
        this.userSkt.on(UserAction.IssueCommand, this.issueCommand.bind(this));
        this.userSkt.on(UserAction.TickPrediction, this.getTickPrediction.bind(this));
        this.userSkt.on(UserAction.SteamUsername, this.getSteamUsername.bind(this));
    }

    private onUpdateTick(tick: number): void {
        if(!this.room) {
            console.log(this.tag, "Tried to update tick when not in a room");
            return;
        }
        // console.log(this.tag, `Requested tick update to ${tick}`)
        // todo: this log is potentially spammy?
        this.room.currentTick = tick;
    }

    private doesRoomExist(roomId: RoomId, callback: (b: boolean) => void): void {
        let validRoom = this.server.rooms.has(roomId);
        if(!validRoom) {
            this.room = null;
        } else {
            this.server.broadcastRoomUpdate(this.room);
        }
        callback(validRoom);
    }

    private disconnect(): void {
        this.userSkt.leave(this.room?.id);
        this.room?.leave(this.userSkt.id);
        this.server.broadcastRoomUpdate(this.room);
        this.server.userDisconnect(this.userSkt.id);
    }

    private createRoom(mapName: string, commands: MapCommands, tyrantPassword: string, callback: JoinCallback): void {
        if(tyrantPassword === "") {
            tyrantPassword = null;
        }

        let user = this.server.users.get(this.userSkt.id);
        if(!user?.authenticated) {
            console.log(this.tag, `Tried to create room while unauthenticated`);
            callback(err(`[Unauthenticated] Unable to create room`));
            return;
        }

        this.room = new Room(user, mapName, commands, tyrantPassword);
        console.log(this.tag, `Created Room ${this.room.id}`);

        this.userSkt.join(this.room.id);

        this.server.addRoom(this.room);
        callback(of(this.room));
    }

    private joinRoom(roomId: RoomId, callback: JoinCallback): void {
        let user = this.server.users.get(this.userSkt.id);
        if(!user?.authenticated) {
            console.log(this.tag, `Tried to join room while unauthenticated`);
            callback(err(`Unauthenticated users cannot join room`));
            return;
        }

        let room = this.server.rooms.get(roomId);
        if(!room) {
            console.log(this.tag, `Tried to join '${roomId}' which does not exist`)
            callback(err(`Room '${roomId}' does not exist`));
            return;
        }
        this.userSkt.join(room.id);
        room.join(user);
        this.server.broadcastRoomUpdate(room);
        this.room = room;

        callback(of(room));
    }

    private leaveRoom(callback: JoinCallback): void {
        if(!this.room) {
            console.log(this.tag, `Tried to leave room not in a room`);
            callback(err(`Cannot join tyrant when not in a room`));
            return;
        }
        this.userSkt.leave(this.room.id);
        this.room.leave(this.userSkt.id);
        this.server.broadcastRoomUpdate(this.room);
        this.room = null;
        callback(of(null));
    }

    private joinTyrant(password: string, callback: JoinCallback): void {
        if(!this.room) {
            console.log(this.tag, `Tried to join tyrants when not in a room`);
            callback(err(`Cannot join tyrant when not in a room`));
            return;
        }
        if(this.room.tryJoinTyrant(this.userSkt.id, password)) {
            this.server.broadcastRoomUpdate(this.room);
            callback(of(this.room));
            return;
        }
        console.log(this.tag, "Tried to join tyrants with an incorrect launch code")
        callback(err(`Incorrect launch code`));
    }

    private leaveTyrant(callback: JoinCallback): void {
        if(!this.room) {
            console.log(this.tag, `Tried to leave tyrants when not in a room`);
            callback(err(`Cannot leave tyrant when not in a room`));
            return;
        }
        this.room.leaveTyrant(this.userSkt.id);
        this.server.broadcastRoomUpdate(this.room);
        callback(of(this.room));
    }

    private issueCommand(command: Command, callback: JoinCallback): void {
        if(!this.room) {
            console.log(this.tag, `Tried to issue a command when not in a room`);
            callback(err(`Cannot issue command when not in a room`));
            return;
        }

        this.room.issueCommand(this.userSkt.id, command)
        this.server.broadcastRoomUpdate(this.room);
        callback(of(this.room));
    }

    private getTickPrediction(callback: (result: Result<number>) => void): void {
        if(!this.room) {
            console.log(this.tag, `Tried to get a tick prediction when not in a room`);
            callback(err(`Cannot get a tick prediction when not in a room`));
            return;
        }
        callback(of(this.room.nextExecTick));
    }

    private async getSteamUsername(steamId: string, callback: (user: AuthenticatedUser) => void): Promise<void> {
        const baseUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`;
        const params = new URLSearchParams({
            key: process.env.STEAM_DEVELOPER_API_KEY,
            steamids: steamId,
        });

        let name: string;
        let resolved: boolean;

        try {
            name = await fetch(`${baseUrl}?${params}`)
                .then(resp => resp.json())
                .then((data: SteamPlayerSummaryResponse) => data.response.players[0].personaname);
            resolved = true;
            console.log(this.tag, `Successfully resolved name '${name}' from steam`);
        } catch (e) {
            // default to ID if username can't be fetched
            name = steamId;
            resolved = false;
            console.log(this.tag, `Failed to resolve name for '${steamId}' from steam for the following reason:`);
            console.log(this.tag, e);
        }

        const authenticatedUser: AuthenticatedUser = {
            platform: {
                userId: steamId,
                type: "steam",
            },
            name,
            resolved,
            authenticated: true,
            sktId: this.userSkt.id,
        }

        this.server.users.set(this.userSkt.id, authenticatedUser);
        callback(authenticatedUser);
    }

    private get tag(): string {
        return `[User ${this.userSkt.id}]`;
    }
}