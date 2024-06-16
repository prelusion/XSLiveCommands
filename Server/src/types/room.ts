import {AuthenticatedUser, SocketId} from "./user";
import {MapContext} from "./map-context";
import {EXEC_TICK_OFFSET} from "../main";
import {CommandName, CommandStruct, MapCommands} from "./commands/structs";
import {Command, ScheduledCommand} from "./commands/scheduled";

export type RoomId = string;

interface IRoom {
    id: RoomId,
    hostId: SocketId,
    mapCtx: MapContext,
    players: Array<[SocketId, AuthenticatedUser]>,
    tyrants: Array<SocketId>,
}

export class Room {
    public id: RoomId
    public hostId: SocketId
    public tyrantPassword: string | null
    public mapCtx: MapContext

    private readonly players: Map<SocketId, AuthenticatedUser>
    private readonly tyrants: Set<SocketId>

    public constructor(
        host: AuthenticatedUser,
        mapName: string,
        commands: MapCommands,
        tyrantPassword: string | null,
    ) {
        this.id = Date.now().toString();
        this.hostId = host.sktId;
        this.mapCtx = {
            name: mapName,
            commands,
            events: [],
            lastExecTick: -1,
            currentTick: -1,
        }
        this.players = new Map();
        this.tyrants = new Set();
        this.players.set(host.sktId, host);
        this.tyrantPassword = tyrantPassword
    }

    public join(
        user: AuthenticatedUser,
    ): void {
        this.players.set(user.sktId, user)
        console.log(this.tag, `+ ${this.userLog(user.sktId)}`);
    }

    public leave(
        userId: SocketId,
    ): void {
        console.log(this.tag, `- ${this.userLog(userId)}`);
        this.tyrants.delete(userId);
        this.players.delete(userId);

        /* Switch lobby host when previous lobby host disconnects */
        if (this.hostId === userId && this.players.size > 0) {
            [this.hostId] = this.players.keys();
            console.log(this.tag, `★ ${this.userLog(this.hostId)}`);
        }
    }

    public tryJoinTyrant(
        userId: SocketId,
        password: string,
    ): boolean {
        if(this.tyrantPassword !== null && this.tyrantPassword !== password) {
            return false;
        }

        this.tyrants.add(userId);
        console.log(this.tag, `↑ ${this.userLog(userId)}`);
        return true;
    }

    public leaveTyrant(
        userId: SocketId,
    ): void {
        this.tyrants.delete(userId);
        console.log(this.tag, `↓ ${this.userLog(userId)}`);
    }

    public issueCommand(
        userId: SocketId,
        command: Command,
    ): boolean {
        if(!this.tyrants.has(userId)) {
            return false;
        }
        const scheduled: ScheduledCommand = {
            ...command,
            isScheduled: true,
            execTick: this.nextExecTick,
        };

        this.mapCtx.lastExecTick = scheduled.execTick;
        this.mapCtx.events.push(scheduled)
        const args = command.params.map(param => `${param.name} = ${param.value}`).join(", ");
        console.log(this.tag, `⮞ ${this.userLog(userId)} ↦ ${command.function}(${args})`);

        return true;
    }

    public get currentTick(): number {
        return this.mapCtx.currentTick;
    }

    public set currentTick(value: number) {
        if(value === null || value === undefined) {
            this.mapCtx.currentTick = 0;
        }

        this.mapCtx.currentTick = Math.max(this.mapCtx.currentTick, value);
        // console.log(this.tag, `@ ${value}`);
        // todo: this log is potentially spammy?
    }

    public get nextExecTick(): number {
        return Math.max(this.currentTick, this.mapCtx.lastExecTick) + EXEC_TICK_OFFSET
    }

    public get numTyrants(): number {
        return this.tyrants.size;
    }

    public get numPlayers(): number {
        return this.players.size;
    }

    private getPlayerName(userId: SocketId): string | null {
        const player = this.players.get(userId);
        if(!player?.resolved) {
            return null;
        }
        return player.name;
    }

    public get commands(): Map<CommandName, CommandStruct> {
        return new Map(Object.entries(this.mapCtx.commands));
    }

    /* do not remove this, used by socket.io */
    public toJSON(): IRoom {
        return {
            id: this.id,
            hostId: this.hostId,
            mapCtx: this.mapCtx,
            players: Array.from(this.players),
            tyrants: Array.from(this.tyrants),
        }
    }

    private get tag(): string {
        return `[Room ${this.id} (${this.numTyrants}/${this.numPlayers}) ${this.currentTick}]`
    }

    private userLog(userId: SocketId): string {
        const name = this.getPlayerName(userId);
        if(name) {
            return `${userId} (${name})`;
        }
        return `${userId}`;
    }
}