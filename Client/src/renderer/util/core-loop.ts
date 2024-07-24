import {UserServerAction} from "./user-server-action";
import {ensure} from "../../shared/src/util/general";
import {ScheduledCommand} from "../../shared/src/types/commands/scheduled";

const {setInterval, clearInterval} = window;

export class CoreLoop {
    private static loopInterval: number | null = null;
    private static nextCmdExecTick: number = 0;
    private static nextCmdIdx: number = 0;

    public static READ_SPEED: number = Math.round(1000/60);

    private static async reset(): Promise<void> {
        await window.fs.deleteXsDataFiles(ensure(UserServerAction.platform), this.mapName);
        UserServerAction.currentLocalTick = -1;
        this.nextCmdExecTick = 0;
        this.nextCmdIdx = 0;
    }

    public static async start(): Promise<void> {
        await this.reset();
        this.loopInterval = setInterval(this.coreLoop.bind(this), this.READ_SPEED);
    }

    public static async stop(): Promise<void> {
        if(!this.loopInterval) {
            return;
        }
        clearInterval(this.loopInterval);
        this.loopInterval = null;
        await this.reset();
    }

    private static async coreLoop(): Promise<void> {
        const currentTick = await window.fs.readTick(ensure(UserServerAction.platform), this.mapName);
        if(!currentTick) {
            return;
        }
        console.log(currentTick);
        UserServerAction.currentLocalTick = currentTick;
        UserServerAction.updateTick(currentTick);
        if(currentTick < this.nextCmdExecTick || this.nextCmdIdx === this.scheduledCommands.length) {
            return;
        }

        const event: ScheduledCommand = this.scheduledCommands[this.nextCmdIdx++];
        this.nextCmdExecTick = event.execTick;

        await window.fs.writeCommand(ensure(UserServerAction.platform), event);
    }

    private static get scheduledCommands(): Array<ScheduledCommand> {
        return ensure(UserServerAction.room).mapCtx.events;
    }

    private static get mapName(): string {
        return ensure(UserServerAction.room).mapCtx.name;
    }
}
