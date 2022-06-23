import {Room} from "../interfaces";
import {createRoom} from "../scripts/rooms";

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

    public createRoom(id: string, host: string, scenario: string): Room {
        const connections: string[] = [host];

        const room: Room = createRoom(id, host, scenario, connections);
        this.rooms.push(room);

        return room;
    }

    public joinRoom(roomId: string, clientId: string) {
        const room = this.getRoomByID(roomId);

        if (room !== undefined) {
            room.connections.push(clientId);
        }
    }

    public leaveRoom(roomId: string, clientId: string) {
        const room = this.getRoomByID(roomId);
        if (room) {
            room.connections = room.connections.filter((connId) => {
                return connId !== clientId;
            });

            if (room.connections.length === 0) {
                this.removeRoom(roomId);
            }
        }
    }

    public removeRoom(roomId: string) {
        return this.rooms = this.rooms.filter(room => room.id !== roomId);
    }

    public getNumberOfConnections(id: string): number {
        return this.getRoomByID(id)?.connections.length;
    }

    public getRoomByID(id: string): Room | undefined {
        return this.rooms.find(room => room.id === id);
    }

    get rooms(): Room[] {
        return this._rooms;
    }

    set rooms(value: Room[]) {
        this._rooms = value;
    }
}
