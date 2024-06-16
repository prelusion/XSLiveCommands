/**
 * A type for getting a union of all possible property value types
 */
export type valueof<T> = T[keyof T];
