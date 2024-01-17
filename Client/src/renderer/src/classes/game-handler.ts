import {QueueHandler} from "./queue-handler";
import {SocketHandler} from "./socket-handler";
import {CommandEvent} from "../../../shared/src/types/command";
import {ensure} from "../../../shared/src/util/general";

const {setInterval, clearInterval} = window;

export class GameHandler {
    private constructor() {
        /* Singleton */
    }

    private static _instance: GameHandler | null = null;

    private coreInterval = -1;
    private lastCommandCycle = -1;
    private _steamId = "";
    private _steamName = "";

    static get instance(): GameHandler {
        if (this._instance === null) {
            this._instance = new GameHandler();
        }
        return this._instance;
    }

    public async resetState(map: string): Promise<void> {
        await window.fs.deleteXsDataFiles(this.steamId, map);
        this.lastCommandCycle = -1;
        QueueHandler.instance.clear();
        this.stopCoreLoop();
    }

    public startCoreLoop(map: string): void {
        // Tick rate of highFrequency rule in XS
        const readSpeed = Math.round(1000 / 60);

        this.coreInterval = setInterval(async () => {
            const cycle = await window.fs.readCycle(this.steamId, map);
            if (cycle !== undefined) {
                // Todo: Add & Test this
                // if (SocketHandler.instance.currentCycle !== cycle) {
                //     SocketHandler.instance.sendCycle(cycle);
                //     SocketHandler.instance.currentCycle = cycle;
                // }
                SocketHandler.instance.sendCycle(cycle);

                // console.log("\n\n")
                // console.log(`this.lastCommandCycle: ${this.lastCommandCycle}`);
                // console.log(`cycle: ${cycle}`);
                // console.log(`QueueHandler.isEmpty(): ${QueueHandler.instance.isEmpty()} (${QueueHandler.instance.length()})`);

                // If the last registered command execution cycle has passed and there are more commands
                // Send the next command to XS
                if (this.lastCommandCycle < cycle && !QueueHandler.instance.isEmpty()) {
                    const event: CommandEvent = ensure(QueueHandler.instance.dequeue());

                    console.log("Writing event: ")
                    console.log(event)

                    this.lastCommandCycle = event.executeCycleNumber;
                    await window.fs.writeEvent(this.steamId, map, event);
                    console.log(`writing finished...`);
                }
            }
        }, readSpeed);
    }

    public stopCoreLoop(): void {
        if (this.coreInterval !== null) {
            clearInterval(this.coreInterval);
        }
    }

    get steamId(): string {
        return this._steamId;
    }

    set steamId(value: string) {
        this._steamId = value;
    }

    get steamName(): string {
        return this._steamName;
    }

    set steamName(value: string) {
        this._steamName = value;
    }
}