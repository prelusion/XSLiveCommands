export type Result<T> = {isError: false, value: T} | {isError: true, error: string}

export function ok<T>(value: T): Result<T> {
    return {value, isError: false};
}
export function err<T>(error: string): Result<T> {
    return {error, isError: true};
}