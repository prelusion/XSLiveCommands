import {UserServerAction} from "./user-server-action";
import {ScheduledCommand} from "../../../shared/src/types/commands/scheduled";
import {ensure} from "../../../shared/src/util/general";

const {setInterval, clearInterval} = window;

export class RwCoreLoop {
    private static interval: number | null = null;
    private static nextCmdExecTick: number = 0;
    private static nextCmdIdx: number = 0;

    private static READ_SPEED: number = Math.round(1000/60);

    private static async resetState(): Promise<void> {
        await window.fs.deleteXsDataFiles(ensure(UserServerAction.platform), this.mapName);
        this.nextCmdExecTick = 0;
        this.nextCmdIdx = 0;
    }

    public static async startCoreLoop(): Promise<void> {
        await this.resetState();
        this.interval = setInterval(this.coreLoop.bind(this), this.READ_SPEED);
    }

    public static async stopCoreLoop(): Promise<void> {
        if(!this.interval) {
            return;
        }
        clearInterval(this.interval);
        this.interval = null;
        await this.resetState();
    }

    private static async coreLoop(): Promise<void> {
        const currentTick = await window.fs.readCycle(ensure(UserServerAction.platform), this.mapName);
        if(!currentTick) {
            return;
        }
        UserServerAction.updateTick(currentTick);
        if(currentTick < this.nextCmdExecTick || this.nextCmdIdx === this.scheduledCommands.length) {
            return;
        }

        const event: ScheduledCommand = this.scheduledCommands[this.nextCmdIdx++];
        this.nextCmdExecTick = event.execTick;

        await window.fs.writeEvent(ensure(UserServerAction.platform), this.mapName, event);
    }

    private static get scheduledCommands(): Array<ScheduledCommand> {
        return ensure(UserServerAction.room).mapCtx.events;
    }

    private static get mapName(): string {
        return ensure(UserServerAction.room).mapCtx.name;
    }
}