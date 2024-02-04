import {MainError} from "../../shared/src/types/errors";
import {MainErrorTypes} from "../../shared/src/util/errors";

/**
 * @param reason The reason for the error
 * @param type The type of the error, makes it easier to identify
 */
export function createError(reason: string, type: MainErrorTypes|undefined = undefined): MainError {
    const err: MainError = {
        error: "error",
        reason: reason,
    };
    
    if (type !== undefined) {
        err.type = type
    }
    
    return err;
}