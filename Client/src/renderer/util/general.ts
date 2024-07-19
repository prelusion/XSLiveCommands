import {XSLC_VER_STR} from "../../shared/src/types/version";


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
export function changeTitle(title: string, prefix = `XS Live Commands ${XSLC_VER_STR}`, sep = "|"): void {
    document.title = `${prefix} ${title ? sep : ''} ${title}`
}

/**
 * Checks if given value is string (or String(...))
 * @param value the value to check
 */
export function isString(value: unknown): value is string {
    return typeof value === 'string' || value instanceof String
}

