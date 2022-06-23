import {CommandEvent} from "@/interfaces/general";

export class QueueHandler {
    private constructor() {
        /* Singleton */
    }

    private static _instance: QueueHandler | null = null;

    private queue: Array<CommandEvent> = [];

    static get instance(): QueueHandler {
        if (this._instance === null) {
            this._instance = new QueueHandler();
        }
        return this._instance;
    }

    public isEmpty(): boolean {
        return this.queue.length === 0;
    }

    public enqueue(event: CommandEvent): void {
        this.queue.push(event);
    }

    public dequeue(): CommandEvent | undefined {
        return this.queue.shift();
    }

    public clear(): void {
        this.queue.length = 0;
    }

    public length(): number {
        return this.queue.length;
    }
}
