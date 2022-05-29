import {Event} from "./interfaces";

export class Event_handler {
    private _eventQueue: Event[];

    constructor() {
        this._eventQueue = []
    }

    isEmpty() {
        return (this._eventQueue.length === 0);
    }

    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        return this._eventQueue.shift();
    }

    enqueue(event: Event) {
        this._eventQueue.push(event);
    }
}
