import {ClientEvent} from "../interfaces";

export class EventHandler {
    private _eventHistory: ClientEvent[];
    private _event: ClientEvent;

    constructor() {
        this._event = null;
        this._eventHistory = [];
    }

    get event(): ClientEvent {
        return this._event;
    }

    get eventHistory(): ClientEvent[] {
        return this._eventHistory;
    }

    get lastExecutionCycle(): number {
        if (this.eventHistory.length === 0) {
            return -1;
        }
        return this.eventHistory[this.eventHistory.length - 1].executeCycleNumber;
    }

    set event(event: ClientEvent) {
        this.eventHistory.push(event)
        this._event = event;
    }
}
