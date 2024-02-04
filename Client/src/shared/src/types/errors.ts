import {MainErrorTypes} from "../util/errors";

export interface MainError {
    error: 'error';
    reason: string;
    type?: MainErrorTypes;
}