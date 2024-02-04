import {CLIENT_VERSION} from "../versions";
import {MainError} from "../../../shared/src/types/errors";

/**
 * Easy way of logging values returned from changed functions
 */
export function logThis<T>(value: T): T {
    console.log(value);
    return value;
}

/**
 * Add a leading zero if the number is less than 10
 *
 * @param num
 */
export function zeroLead(num: string | number): string {
    return num.toString().length === 1 ? '0' + num : num.toString();
}

/**
 * Change the window title
 *
 * @param title The title to change too (after the separator)
 * @param prefix The prefix of the title (before the separator)
 * @param sep The separator between prefix and title
 */
export function changeTitle(title: string, prefix = `XS Live Commands (v${CLIENT_VERSION})`, sep = "|"): void {
    document.title = `${prefix} ${title ? sep : ''} ${title}`
}

/**
 * Checks if given value is string (or String(...))
 * @param value the value to check
 */
export function isString(value: unknown): value is string {
    return typeof value === 'string' || value instanceof String
}

type PotentialError<T> = {
    isError: true;
    value: MainError;
} | {
    isError: false;
    value: T;
}

/**
 * Wraps a return value and checks if it has an error format.
 * This can then be handled using the normal promise logics (then & catch)
 * @param value The value that could become an error
 */
export async function handle<T>(
    value: (T | MainError) | Promise<T | MainError>,
): Promise<PotentialError<T>> {
    return Promise
        .resolve(value)
        .then((value) => {
            const isObject = typeof value === 'object' && value !== null;
            const isMainError = isObject
                && 'error' in value
                && 'type' in value
                && 'reason' in value
                && value.error === 'error';

            /* Force the type because it's being dumb :/ */
            return {
                isError: isMainError,
                value
            } as PotentialError<T>
        })
}
