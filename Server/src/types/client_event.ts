export interface ClientEvent {
    funcName: string;  // Todo: rename to "function"
    params: Array<string | number | boolean>;
    executeCycleNumber: number;
}