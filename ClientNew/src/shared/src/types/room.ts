import {AuthenticatedUser, SocketId} from "./user";
import {MapContext} from "./map-context";
import {CommandName, CommandStruct, MapCommands} from "./commands/structs";


export type RoomId = string;

export interface IRoom {
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

    private players: Map<SocketId, AuthenticatedUser>
    private tyrants: Set<SocketId>

    public static new(): Room {
        return new Room(<AuthenticatedUser>{sktId: ""}, "", {}, null);
    }

    public static from(iRoom: IRoom): Room {
        const room = Room.new();
        room.id = iRoom.id;
        room.hostId = iRoom.hostId;
        room.mapCtx = iRoom.mapCtx;
        room.players = new Map(iRoom.players);
        room.tyrants = new Set(iRoom.tyrants);
        return room;
    }

    public constructor(
        host: AuthenticatedUser,
        mapName: string,
        commands: MapCommands,
        tyrantPassword: string | null,
    ) {
        this.id = Date.now().toString();
        this.hostId = host.sktId;
        this.mapCtx = {
            name: mapName.replace(/.(?:aoe2scenario|rms2?)$/, ''),
            file: mapName,
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

    public hasPlayer(userId: SocketId): boolean {
        return this.players.has(userId);
    }

    public isTyrant(userId: SocketId): boolean {
        return this.tyrants.has(userId);
    }

    public getPlayerName(userId: SocketId): string | undefined {
        return this.players.get(userId)?.name;
    }

    public get numTyrants(): number {
        return this.tyrants.size;
    }

    public get numPlayers(): number {
        return this.players.size;
    }

    public get commands(): Map<CommandName, CommandStruct> {
        return new Map(Object.entries(this.mapCtx.commands));
    }

    public get playerIds(): IterableIterator<SocketId> {
        return this.players.keys();
    }
}
