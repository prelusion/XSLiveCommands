import {Server, Socket} from "socket.io";
import {ClientEvent, Command, Commands, Room} from "../interfaces";
import {createRoom} from "../scripts/rooms";
import {EXECUTE_CYCLE_OFFSET} from "../index";

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

    public createRoom(roomId: string, socket: Socket, map: string, commands: Commands, password: string | null): Room {
        console.log(`[Room ${roomId}] >> Created`);
        socket.join(roomId);

        const socketId = socket.id;

        const room: Room = createRoom(roomId, socketId, map, commands, password, [socketId]);
        this.rooms.push(room);

        return room;
    }

    public joinRoom(roomId: string, socket: Socket) {
        socket.join(roomId);

        const room = this.getRoomByID(roomId);

        if (room !== undefined) {
            room.connections.push(socket.id);

            console.log(`[Room ${roomId}] >> Socket joined room (current: ${room.connections.length})`);

            this.sendRoomConnectionCountUpdate(roomId, room.connections.length);
        }
    }

    public becomeTyrant(roomId: string, socket: Socket): void {
        const room = this.getRoomByID(roomId);

        if (!room.connections.includes(socket.id)) {
            return;
        }

        room.tyrants.push(socket.id);

        console.log(`[Room ${roomId}] >> Socket switched to tyrant mode. Rate: ${room.tyrants.length}/${room.connections.length}`);
    }

    public loseTyrant(roomId: string, socket: Socket): void {
        const room = this.getRoomByID(roomId);

        if (!room.connections.includes(socket.id)) {
            return;
        }

        room.tyrants = room.tyrants.filter(id => id !== socket.id);

        console.log(`[Room ${roomId}] >> Socket switched to normal mode. Rate: ${room.tyrants.length}/${room.connections.length}`);
    }

    public leaveRoom(roomId: string, socket: Socket) {
        socket.leave(roomId);

        const room = this.getRoomByID(roomId);
        if (room) {
            room.connections = room.connections.filter((connId) => {
                return connId !== socket.id;
            });

            console.log(`[Room ${roomId}] >> Socket left room (current: ${room.connections.length})`);

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

    public sendRoomNewCommand(roomId: string, command: Command): void {
        const room = RoomHandler.instance.getRoomByID(roomId);

        if (room === undefined)
            return;

        const clientEvent: ClientEvent = toClientEvent(command);

        // Making sure that the new event has 5 cycles to be executed after the last event or current cycle.
        room.last_execution_cycle = clientEvent.executeCycleNumber =
            this.getExecutionCycleForNewCommand(roomId);

        console.log(`[Room ${roomId}] Command registered: ${clientEvent.funcName} executed at: ${clientEvent.executeCycleNumber}`);

        this.io.to(roomId).emit("event", clientEvent);
        room.events.push(clientEvent);
    }

    public getExecutionCycleForNewCommand(roomId: string): number {
        const room = this.getRoomByID(roomId);
        return Math.max(room.current_cycle, room.last_execution_cycle) + EXECUTE_CYCLE_OFFSET;
    }

    public removeRoom(roomId: string) {
        console.log(`[Room ${roomId}] >> Deleted due to no active connections`);
        return this.rooms = this.rooms.filter(room => room.id !== roomId);
    }

    public getNumberOfConnections(roomId: string): number {
        const room = this.getRoomByID(roomId);

        if (!room) {
            return -1;
        }
        return room.connections.length;
    }

    public getRoomByID(roomId: string): Room | undefined {
        return this.rooms.find(room => room.id === roomId);
    }

    public setRoomCurrentCycle(roomId: string, cycle: number) {
        const room = this.getRoomByID(roomId);
        if (typeof cycle !== "number" || room === undefined)
            return;

        console.log(`[Room ${roomId}] cycle update: ${cycle} ${cycle <= room.current_cycle ? '[Ignored]' : ''}`);

        if (cycle <= room.current_cycle)
            return;

        room.current_cycle = cycle;
    }

    get rooms(): Room[] {
        return this._rooms;
    }

    set rooms(value: Room[]) {
        this._rooms = value;
    }
}

function toClientEvent(command: Command): ClientEvent {
    return {
        funcName: command.funcName,
        params: command.params,
        executeCycleNumber: 0,
    };
}
