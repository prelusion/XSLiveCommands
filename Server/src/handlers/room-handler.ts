import {Server, Socket} from "socket.io";
import {createRoomObject, createRoomPlayer} from "../scripts/rooms";
import {EXECUTE_CYCLE_OFFSET} from "../index";
import {Room} from "../types/room";
import {ClientEvent} from "../types/client_event";
import {Command, Commands} from "../types/command";

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

    public createRoom(roomId: string, socket: Socket, name: string, map: string, commands: Commands, password: string | null): Room {
        console.log(`[Room ${roomId}] >> Created`);
        socket.join(roomId);

        const socketId = socket.id;

        const room: Room = createRoomObject(roomId, socketId, name, map, commands, password);
        this.rooms.push(room);

        return room;
    }

    public joinRoom(roomId: string, name: string, socket: Socket) {
        socket.join(roomId);

        const room = this.getRoomByID(roomId);

        if (room !== undefined) {
            room.connections[socket.id] = createRoomPlayer(socket.id, name);
            const length = this.getNumberOfConnections(roomId);

            console.log(`[Room ${roomId}] >> Socket joined room (current: ${length})`);

            this.sendRoomConnectionCountUpdate(roomId, length);
        }
    }

    public becomeTyrant(roomId: string, socket: Socket): void {
        const room = this.getRoomByID(roomId);

        if (!(socket.id in room.connections)) {
            return;
        }

        room.tyrants.push(socket.id);

        const tyrantLen = room.tyrants.length;
        const ConLen = this.getNumberOfConnections(roomId);
        console.log(`[Room ${roomId}] >> Socket switched to tyrant mode. Rate: ${tyrantLen}/${ConLen}`);
    }

    public loseTyrant(roomId: string, socket: Socket): void {
        const room = this.getRoomByID(roomId);

        if (!(socket.id in room.connections)) {
            return;
        }

        room.tyrants = room.tyrants.filter(id => id !== socket.id);

        const tyrantLen = room.tyrants.length;
        const ConLen = this.getNumberOfConnections(roomId);
        console.log(`[Room ${roomId}] >> Socket switched to normal mode. Rate: ${tyrantLen}/${ConLen}`);
    }

    public leaveRoom(roomId: string, socket: Socket) {
        socket.leave(roomId);

        const room = this.getRoomByID(roomId);
        if (room) {
            delete room.connections[socket.id];
            const length = this.getNumberOfConnections(roomId);

            console.log(`[Room ${roomId}] >> Socket left room (current: ${length})`);

            if (length === 0) {
                this.removeRoom(roomId);
                return;
            }

            this.sendRoomConnectionCountUpdate(roomId, length);
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
        return Object.keys(room.connections).length;
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
