import {GameHandler} from "./game-handler";
import {Command, CommandTemplates} from "../../../shared/src/types/command";
import {Room} from "../interfaces/general";
import {Socket} from "socket.io-client";
import {QueueHandler} from "./queue-handler";
import {Store} from "vuex";
import {assert, ensure} from "../../../shared/src/util/general";
import {State} from "vue";

export class SocketHandler {
    private constructor() {
        /* Singleton */
    }

    private static _instance: SocketHandler | null = null;

    private _socket: Socket | null = null;
    private _room: Room | null = null;
    private _currentCycle = -1;

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

        if (cycle !== undefined && cycle >= 0) {
            this.socket.emit("cycleUpdate", cycle);
        }
    }

    public joinRoomAsPlayer(roomId: string): Promise<void> {
        return new Promise((resolve, reject): void => {
            assert(this.socket);

            this.socket.emit("joinRoomAsPlayer", roomId,
                async (room: Room | null) => {
                    if (room === null) {
                        setTimeout(() => reject(`Unable to join room: '${roomId}'`), 200);
                        return;
                    }

                    if (room.map) {
                        this.room = room;
                        await GameHandler.instance.resetState(room.map);

                        // Set queue to whatever was received when joining the room
                        if (room.events.length > 0) {
                            QueueHandler.instance.overwrite(room.events);
                        }

                        GameHandler.instance.startCoreLoop(room.map);

                        resolve();
                    } else {
                        reject(`An unknown error occurred. Please try again.`);
                    }
                    return;
                });
        });
    }

    public becomeTyrant(roomId: string, password: string): Promise<void> {
        return new Promise((resolve, reject): void => {
            assert(this.socket);

            this.socket.emit("becomeTyrant", roomId, password,
                async (room: Room | null, error: string | null) => {
                    if (room === null) {
                        setTimeout(() => reject(error), 200);
                        return;
                    }

                    if (room.map) {
                        this.room = room;
                        resolve();
                    } else {
                        reject(`An unknown error occurred. Please try again.`);
                    }

                    return;
                });
        });
    }

    public loseTyrant(roomId: string): Promise<void> {
        return new Promise((resolve, reject): void => {
            assert(this.socket);

            this.socket.emit("loseTyrant", roomId,
                async (room: Room | null, error: string | null) => {
                    if (room === null) {
                        setTimeout(() => reject(error), 200);
                        return;
                    }

                    if (room.map) {
                        this.room = room;
                        resolve();
                    } else {
                        reject(`An unknown error occurred. Please try again.`);
                    }
                });
        });
    }

    public verifyRoomExistsOnReconnect($store: Store<State>): void {
        assert(this.socket);

        if (!this.room)
            return

        this.socket.emit('verifyRoomExists', this.room.id, async (exists: boolean) => {
            if (exists)
                return;

            await SocketHandler.instance.leaveRoom();

            $store.commit("changeWindow", {
                window: "MainRoom",
                data: {
                    'message': 'The server does not recognize the room anymore, please join or create a new one.'
                }
            });
        });
    }

    public sendCommand(command: Command): void {
        assert(this.socket);

        this.socket.emit("registerCommand", command);
    }

    public leaveRoom(): Promise<void> {
        return new Promise((resolve): void => {
            assert(this.socket);
            if (this.room === null) {
                return resolve();
            }

            const map = ensure(this.room).map;
            this.socket.emit("leaveRoom", async () => {
                GameHandler.instance.resetState(map).then(resolve);
            });
        });
    }

    public createRoom(filename: string, commands: CommandTemplates, password = ""): Promise<void> {
        return new Promise((resolve, reject) => {
            assert(this.socket);

            this.socket.emit("createRoom", filename, commands, password, async (room: Room) => {
                this.room = room;

                if (room.map && room.commands) {
                    await GameHandler.instance.resetState(room.map);
                    GameHandler.instance.startCoreLoop(room.map);

                    resolve();
                } else {
                    reject("Invalid room");
                }
            });
        });
    }

    public getExecutionCyclePrediction(): Promise<number> {
        return new Promise((resolve) => {
            assert(this.socket);

            this.socket.emit("executionCyclePrediction", async (c: number) => {
                resolve(c);
            });
        });
    }

    get currentCycle(): number {
        return this._currentCycle;
    }

    set currentCycle(value: number) {
        this._currentCycle = value;
    }

    public registerEventListeners(): void {
        assert(this.socket);
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
