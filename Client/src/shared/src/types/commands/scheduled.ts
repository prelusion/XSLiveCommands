export enum ParamType {
    INT,
    FLOAT,
    BOOL,
    STRING,
}

interface NumberParam {
    name: string,
    type: ParamType.INT | ParamType.FLOAT,
    value: number,
}

interface StringParam {
    name: string,
    type: ParamType.STRING,
    value: string,
}

interface BoolParam {
    name: string,
    type: ParamType.BOOL,
    value: boolean,
}

export type Param = NumberParam | StringParam | BoolParam

export interface UnscheduledCommand {
    function: string,
    params: Array<Param>,
    isScheduled: false,
}

export interface ScheduledCommand {
    function: string,
    params: Array<Param>,
    isScheduled: true,
    execTick: number,
}

export type Command = ScheduledCommand | UnscheduledCommand