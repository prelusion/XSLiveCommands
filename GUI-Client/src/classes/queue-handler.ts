import {CommandEvent} from "@/interfaces/general";

export class QueueHandler {
    private constructor() {
        /* Singleton */
    }

    private static _instance: QueueHandler | null = null;

    private _queue: Array<CommandEvent> = [];

    static get instance(): QueueHandler {
        if (this._instance === null) {
            this._instance = new QueueHandler();
        }
        return this._instance;
    }

    public isEmpty(): boolean {
        return this._queue.length === 0;
    }

    public enqueue(event: CommandEvent): void {
        this._queue.push(event);
    }

    public dequeue(): CommandEvent | undefined {
        return this._queue.shift();
    }

    public clear(): void {
        this._queue.length = 0;
    }

    public length(): number {
        return this._queue.length;
    }

    public overwrite(queue: Array<CommandEvent>): void {
        this._queue = queue;
    }
}
