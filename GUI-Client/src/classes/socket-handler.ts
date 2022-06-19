import {Socket} from "socket.io-client";
import {assert} from "@/util/general";
import {Room} from "@/interfaces/general";

export class SocketHandler {
    private constructor() {
        /* Singleton */
    }

    private static _instance: SocketHandler | null = null;

    private _socket: Socket | null = null;
    private _room: Room | null = null;

    static get instance(): SocketHandler {
        if (this._instance === null) {
            this._instance = new SocketHandler();
        }
        return this._instance;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    public sendCycle(cycle: number) {
        assert(this.socket);
        assert(this._room);

        if (cycle !== undefined && cycle >= 0) {
            this.socket.emit("cycleUpdate", this._room.id, cycle);
        }
    }

    get socket(): Socket | null {
        return this._socket;
    }

    set socket(value: Socket | null) {
        this._socket = value;
    }

    get room(): Room | null {
        return this._room;
    }

    set room(value: Room | null) {
        this._room = value;
    }
}