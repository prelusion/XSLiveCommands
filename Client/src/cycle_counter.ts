export class CycleCounter {
    private _cycle: number;
    // private interval: any;
    constructor() {
        this._cycle = 0;
        // this.createInterval();
    }

    // createInterval() {
    //     this.interval = setInterval(() => this.cycle = this.cycle + 1, 200);
    // }

    // pauseCycle(pauseTimer = 10000) {
    //     clearInterval(this.interval)
    //     setTimeout(() => this.createInterval(), pauseTimer)
    // }

    get cycle(): number {
        return this._cycle;
    }

    set cycle(value: number) {
        this._cycle = value;
        // if(value % 99 === 0) this.pauseCycle();
    }
}
