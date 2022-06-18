import {ClientEvent} from "../interfaces";

export class EventHandler {
    private readonly _eventHistory: ClientEvent[];
    private _event: ClientEvent;

    constructor() {
        this._event = null;
        this._eventHistory = [];
    }

    get lastExecutionCycle(): number {
        if (this.eventHistory.length === 0) {
            return -1;
        }
        return this.eventHistory[this.eventHistory.length - 1].executeCycleNumber;
    }

    get event(): ClientEvent {
        return this._event;
    }

    set event(event: ClientEvent) {
        this._event = event;
    }

    get eventHistory(): ClientEvent[] {
        return this._eventHistory;
    }
}
