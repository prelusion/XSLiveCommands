import {Socket} from "socket.io-client";
import {assert, ensure} from "@/util/general";
import {Room} from "@/interfaces/general";
import {GameHandler} from "@/classes/game-handler";

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
        assert(this.room);

        if (cycle !== undefined && cycle >= 0) {
            this.socket.emit("cycleUpdate", this.room.id, cycle);
        }
    }

    public async leaveRoom() {
        assert(this.socket);
        if (this.room === null) {
            return
        }

        this.socket.emit("leaveRoom", () => {
            GameHandler.instance.resetState(ensure(this.room).scenario);
        });
    }

    public createRoom(filename: string): Promise<void> {
        return new Promise((resolve, reject) => {
            assert(this.socket);

            this.socket.emit("createRoom", filename, async (room: Room) => {
                this.room = room;

                if (room.scenario) {
                    await GameHandler.instance.resetState(room.scenario);
                    GameHandler.instance.startCoreLoop(room.scenario);

                    resolve();
                } else {
                    reject('Invalid room');
                }
            });
        })
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