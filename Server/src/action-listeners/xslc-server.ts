import {Room, RoomId} from "../types/room";
import {Server, Socket} from "socket.io";
import {SocketId, UnauthenticatedUser, User} from "../types/user";
import {UserActionListener} from "./user-action-listener";
import {ServerEvent, UserAction} from "../types/actions";

export class XSLCServer {
    public skt: Server
    public rooms: Map<RoomId, Room>
    public users: Map<SocketId, User>
    public listeners: Map<SocketId, UserActionListener>

    public constructor(skt: Server) {
        this.rooms = new Map();
        this.users = new Map();
        this.listeners = new Map();
        this.skt = skt;

        console.log("Starting XSLC Server...");
        this.skt.on(UserAction.NewConnection, this.addListener.bind(this))
    }

    public addListener(userSkt: Socket): void {
        const user: UnauthenticatedUser = {authenticated: false, sktId: userSkt.id};
        this.users.set(userSkt.id, user);
        this.listeners.set(userSkt.id, new UserActionListener(this, userSkt, user));

        console.log(this.tag, `+ User: ${userSkt.id}`);
    }

    public userDisconnect(userId: SocketId): void {
        this.listeners.delete(userId);
        this.users.delete(userId);
        console.log(this.tag, `- User: ${userId}`);
    }

    public broadcastRoomUpdate(room: Room | null): void {
        if(!room) {
            return;
        }
        if(room.numPlayers === 0) {
            this.rooms.delete(room.id);
            console.log(this.tag, `- Room: ${room.id}`);
        }

        this.skt.to(room.id).emit(ServerEvent.RoomUpdate, room);
    }

    public addRoom(room: Room) {
        this.rooms.set(room.id, room);
        console.log(this.tag, `+ Room: ${room.id}`);
    }

    private get tag(): string {
        return `[Server (${this.users.size}|${this.rooms.size})]`;
    }
}
