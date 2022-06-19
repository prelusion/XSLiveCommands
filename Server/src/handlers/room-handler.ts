import {Room} from "../interfaces";

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

    public createRoom(id: string, host: string, scenario: string) {
        const connections: string[] = [];
        connections.push(host);
        this.rooms.push({id, host, scenario, connections, current_cycle: 0, last_execution_cycle: -1})
    }

    public joinRoom(roomId: string, clientId: string) {
        const room = this.getRoomByID(roomId);

        if (room !== undefined) {
            room.connections.push(clientId);
        }
    }

    public leaveRoom(roomId: string, clientId: string) {
        const room = this.getRoomByID(roomId)
        if (room) {
            room.connections = room.connections.filter((connId) => {
                return connId !== clientId;
            });
        }
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
}
