/**
 * Ensure that the parameter exists. Mostly useful in combination with 'Array.find()' which can return undefined.
 *
 * @param argument The argument which is ensured to not be undefined or null
 * @param message The message to use in the error throw when the argument is undefined or null
 *
 * @author Karol Majewski @ https://stackoverflow.com/a/54738437/7230293
 */
import {CLIENT_VERSION} from "../versions";

export function ensure<T>(argument: T | undefined | null, message = "This value was promised to be there."): T {
    if (argument === undefined || argument === null) {
        throw new TypeError(message);
    }

    return argument;
}

/**
 * Assert the parameter given to not be undefined or null. Works in the same way `ensure` does except no
 * value is returned. This is useful for already existing values that might also be 'null' or 'undefined'.
 *
 * @param value The value which is asserted to not be undefined or null
 *
 * @author Aleksey L. @ https://stackoverflow.com/a/59017341/7230293
 */
export function assert(value: unknown): asserts value {
    if (value === undefined || value === null) {
        throw new TypeError("value must be defined");
    }
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