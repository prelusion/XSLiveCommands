import {FormResult} from "@renderer/types/form";

export function validateRules(rules: string[], label: string, value: unknown): FormResult {
    if (rules.length === 0) {
        return {valid: true};
    }

    const validators: Record<string, (...args: any[]) => boolean> = {
        'required': (val: unknown): boolean => val !== null && val !== undefined && val !== '',
        'max': (val: string, max: string): boolean => val !== undefined && (val.toString().length <= parseInt(max, 10)),
        'min': (val: string, min: string): boolean => val !== undefined && (val.toString().length >= parseInt(min, 10)),
        'max-n': (val: number, max: string): boolean => val <= parseInt(max, 10),
        'min-n': (val: number, min: string): boolean => val >= parseInt(min, 10),
        'string': (val: unknown): boolean => typeof val === 'string',
        'number': (val: string): boolean => !isNaN(Number(val)),
    };

    const validatorErrors: Record<string, (...args: any[]) => string> = {
        'required': (): string => `The ${label} is required`,
        'max': (max: string): string => `The ${label} may not be greater than ${max} characters.`,
        'min': (min: string): string => `The ${label} must be at least ${min} characters.`,
        'max-n': (max: string): string => `The ${label} may not be greater than ${max}.`,
        'min-n': (min: string): string => `The ${label} must be at least ${min}.`,
        'string': (): string => `The ${label} must be a string`,
        'number': (): string => `The ${label} must be a number`,
    };

    /* Check if any rule is the required rule */
    const includesRequiredRule = rules.some((rule) => rule === 'required');

    /* Make sure required rule is always executed first */
    if (rules.length > 1 && includesRequiredRule && rules[0] !== 'required') {
        rules = ['required', ...rules.filter(rule => rule !== 'required')];
    }

    const errors: Array<string> = [];
    rules.every((rule) => {
        const [ruleName, ruleParam] = rule.includes(':')
            ? rule.split(':')
            : [rule];

        if (validators[ruleName] && !validators[ruleName](value, ruleParam)) {
            errors.push(validatorErrors[ruleName](ruleParam));
            return false; /* Stop loop */
        }

        return true;
    });

    /* If the value is not required, and the given value is empty, ignore errors and return valid response */
    if (!includesRequiredRule && (value === null || value === undefined || value === '')) {
        return {valid: true};
    }

    return errors.length === 0
        ? {valid: true}
        : {valid: false, errors: errors};
}
