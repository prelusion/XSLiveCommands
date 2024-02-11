import {Server, Socket} from "socket.io";
import {createRoomObject} from "../scripts/rooms";
import {EXECUTE_CYCLE_OFFSET} from "../index";
import {Room} from "../types/room";
import {Command, Commands, ScheduledCommand} from "../types/command";
import {AuthenticatedPlayer} from "../types/player";

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

    public createRoom(roomId: string, player: AuthenticatedPlayer, socket: Socket, map: string, commands: Commands, password: string | null): Room {
        console.log(`[Room ${roomId}] >> Created`);
        socket.join(roomId);

        const socketId = socket.id;

        const room: Room = createRoomObject(roomId, player, socketId, map, commands, password);
        this.rooms.push(room);

        return room;
    }

    public joinRoom(roomId: string, player: AuthenticatedPlayer, socket: Socket) {
        socket.join(roomId);

        const room = this.getRoomByID(roomId);

        if (room !== undefined) {
            room.connections[socket.id] = {tyrant: false, ...player}

            const length = this.getNumberOfConnections(roomId);

            console.log(`[Room ${roomId}] >> Socket joined room (current: ${length})`);

            this.sendRoomConnectionCountUpdate(roomId, room);
        }
    }

    public becomeTyrant(roomId: string, socket: Socket): void {
        const room = this.getRoomByID(roomId);

        if (!(socket.id in room.connections)) {
            return;
        }

        room.connections[socket.id].tyrant = true;

        const tyrantLen = Object.values(room.connections).filter((r) => r.tyrant).length;
        const ConLen = this.getNumberOfConnections(roomId);
        console.log(`[Room ${roomId}] >> Socket switched to tyrant mode. Rate: ${tyrantLen}/${ConLen}`);

        this.sendRoomConnectionCountUpdate(roomId, room);
    }

    public loseTyrant(roomId: string, socket: Socket): void {
        const room = this.getRoomByID(roomId);

        if (!(socket.id in room.connections)) {
            return;
        }

        room.connections[socket.id].tyrant = false;

        const tyrantLen = Object.values(room.connections).filter((r) => r.tyrant).length;
        const ConLen = this.getNumberOfConnections(roomId);
        console.log(`[Room ${roomId}] >> Socket switched to normal mode. Rate: ${tyrantLen}/${ConLen}`);

        this.sendRoomConnectionCountUpdate(roomId, room);
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

            this.sendRoomConnectionCountUpdate(roomId, room);
        }
    }

    public sendRoomConnectionCountUpdate(roomId: string, room: Room) {
        this.io.to(roomId).emit("room-connection-update", room);
    }

    public sendRoomNewCommand(roomId: string, command: Command): void {
        const room = RoomHandler.instance.getRoomByID(roomId);

        if (room === undefined)
            return;

        const cycle = this.getExecutionCycleForNewCommand(roomId);
        const scheduled: ScheduledCommand = {
            ...command,
            executeCycleNumber: cycle,
        }
        room.map.last_execution_cycle = cycle;


        console.log(`[Room ${roomId}] Command registered: ${scheduled.function} executed at: ${scheduled.executeCycleNumber}`);

        this.io.to(roomId).emit("event", scheduled);
        room.map.events.push(scheduled);
    }

    public getExecutionCycleForNewCommand(roomId: string): number {
        const room = this.getRoomByID(roomId);
        return Math.max(room.map.current_cycle, room.map.last_execution_cycle) + EXECUTE_CYCLE_OFFSET;
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

        console.log(`[Room ${roomId}] cycle update: ${cycle} ${cycle <= room.map.current_cycle ? '[Ignored]' : ''}`);

        if (cycle <= room.map.current_cycle)
            return;

        room.map.current_cycle = cycle;
    }

    get rooms(): Room[] {
        return this._rooms;
    }

    set rooms(value: Room[]) {
        this._rooms = value;
    }
}
