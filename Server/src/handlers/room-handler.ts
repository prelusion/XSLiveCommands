import {Room} from "../interfaces";
import {createRoom} from "../scripts/rooms";
import {Server, Socket} from "socket.io";

export class RoomHandler {
    private static _instance = null;

    static get instance(): RoomHandler {
        if (this._instance === null) {
            this._instance = new RoomHandler();
        }
        return this._instance;
    }

    private constructor() {
        //
    }

    private _rooms: Room[] = [];
    private io: Server;

    public registerIo(io: Server) {
        this.io = io;
    }

    public createRoom(roomId: string, socket: Socket, scenario: string): Room {
        socket.join(roomId);

        const socketId = socket.id;
        const connections: string[] = [socketId];

        const room: Room = createRoom(roomId, socketId, scenario, connections);
        this.rooms.push(room);

        return room;
    }

    public joinRoom(roomId: string, socket: Socket) {
        socket.join(roomId);

        const room = this.getRoomByID(roomId);

        if (room !== undefined) {
            room.connections.push(socket.id);
            this.sendRoomConnectionCountUpdate(roomId, room.connections.length);
        }
    }

    public leaveRoom(roomId: string, socket: Socket) {
        socket.leave(roomId);

        const room = this.getRoomByID(roomId);
        if (room) {
            room.connections = room.connections.filter((connId) => {
                return connId !== socket.id;
            });

            if (room.connections.length === 0) {
                this.removeRoom(roomId);
            } else {
                this.sendRoomConnectionCountUpdate(roomId, room.connections.length);
            }
        }
    }

    public sendRoomConnectionCountUpdate(roomId: string, n: number) {
        this.io.to(roomId).emit("room-connection-update", n);
    }

    public removeRoom(roomId: string) {
        return this.rooms = this.rooms.filter(room => room.id !== roomId);
    }

    public getNumberOfConnections(roomId: string): number {
        return this.getRoomByID(roomId)?.connections.length;
    }

    public getRoomByID(roomId: string): Room | undefined {
        return this.rooms.find(room => room.id === roomId);
    }

    public setRoomCurrentCycle(roomId: string, cycle: number) {
        this.getRoomByID(roomId).current_cycle = cycle;
    }

    get rooms(): Room[] {
        return this._rooms;
    }

    set rooms(value: Room[]) {
        this._rooms = value;
    }
}
