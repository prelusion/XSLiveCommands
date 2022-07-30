import {GameHandler} from "@/classes/game-handler";
import {Command, Commands} from "@/interfaces/command";
import {Room} from "@/interfaces/general";
import {assert, ensure} from "@/util/general";
import {Socket} from "socket.io-client";
import {QueueHandler} from "@/classes/queue-handler";

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

        if (cycle !== undefined && cycle >= 0) {
            this.socket.emit("cycleUpdate", cycle);
        }
    }

    public joinRoomAsPlayer(roomId: string): Promise<void> {
        return new Promise((resolve, reject): void => {
            assert(this.socket);

            this.socket.emit("joinRoomAsPlayer", roomId,
                async (room: Room | null) => {
                    if (room === null)
                        return setTimeout(() => reject(`Unable to join room: '${roomId}'`), 200);

                    console.log(room.events)

                    if (room.scenario) {
                        this.room = room;
                        await GameHandler.instance.resetState(room.scenario);

                        // Set queue to whatever was received when joining the room
                        if (room.events.length > 0) {
                            QueueHandler.instance.overwrite(room.events);
                        }

                        GameHandler.instance.startCoreLoop(room.scenario);

                        resolve();
                    } else {
                        reject(`An unknown error occurred. Please try again.`);
                    }
                });
        });
    }

    public joinRoomAsTyrant(roomId: string, password: string): Promise<void> {
        return new Promise((resolve, reject): void => {
            assert(this.socket);

            this.socket.emit("joinRoomAsTyrant", roomId, password,
                async (room: Room | null, error: string | null) => {
                    if (room === null)
                        return setTimeout(() => reject(error), 200);

                    if (room.scenario) {
                        this.room = room;
                        await GameHandler.instance.resetState(room.scenario);
                        GameHandler.instance.startCoreLoop(room.scenario);

                        resolve();
                    } else {
                        reject(`An unknown error occurred. Please try again.`);
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

            const scenario = ensure(this.room).scenario;
            this.socket.emit("leaveRoom", async () => {
                GameHandler.instance.resetState(scenario).then(resolve);
            });
        });
    }

    public createRoom(filename: string, commands: Commands, password = ""): Promise<void> {
        return new Promise((resolve, reject) => {
            assert(this.socket);

            this.socket.emit("createRoom", filename, commands, password, async (room: Room) => {
                this.room = room;

                if (room.scenario && room.commands) {
                    await GameHandler.instance.resetState(room.scenario);
                    GameHandler.instance.startCoreLoop(room.scenario);

                    resolve();
                } else {
                    reject("Invalid room");
                }
            });
        });
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
