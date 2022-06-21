
import {QueueHandler} from "@/classes/queue-handler";
import {SocketHandler} from "@/classes/socket-handler";
import {CommandEvent} from "@/interfaces/general";
import {ensure} from "@/util/general";

export class GameHandler {
    private constructor() {
        /* Singleton */
    }

    private static _instance: GameHandler | null = null;

    private coreInterval: any = -1;
    private cycle = -1;  // Todo: Is this variable even necessary?
    private lastCommandCycle = -1;
    private _steamId = '';

    static get instance(): GameHandler {
        if (this._instance === null) {
            this._instance = new GameHandler();
        }
        return this._instance;
    }

    public async resetState(scenario: string): Promise<void> {
        console.log(this.steamId, scenario);
        await window.fs.deleteXsDataFiles(this.steamId, scenario);
        this.lastCommandCycle = -1;
        this.cycle = -1;
        QueueHandler.instance.clear();
    }

    public startCoreLoop(scenario: string) {
        this.coreInterval = setInterval(async () => {

            const cycle = await window.fs.readCycle(this.steamId, scenario);
            if (cycle !== undefined) {
                SocketHandler.instance.sendCycle(cycle);

                // If the last registered command execution cycle has passed and there are more commands
                // Send the next command to XS
                if (this.lastCommandCycle < cycle && !QueueHandler.instance.isEmpty()) {
                    const event: CommandEvent = ensure(QueueHandler.instance.dequeue());

                    this.lastCommandCycle = event.executeCycleNumber;
                    await window.fs.writeEvent(this.steamId, scenario, event);
                }
            }
        })
    }

    public stopCoreLoop() {
        if (this.coreInterval !== -1) {
            clearInterval(this.coreInterval);
        }
    }

    get steamId(): string {
        return this._steamId;
    }

    set steamId(value: string) {
        this._steamId = value;
    }
}