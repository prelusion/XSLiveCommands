import {FormResult} from "../types/form";

export function validateRules(rules: string[], label: string, value: unknown): FormResult {
    const validators = {
        'required': (val: string): boolean => val !== null && val !== undefined && val !== '',
        'max': (val: string, max: string): boolean => val.toString().length <= parseInt(max, 10),
        'min': (val: string, min: string): boolean => val.toString().length >= parseInt(min, 10),
        'max-n': (val: number, max: string): boolean => val <= parseInt(max, 10),
        'min-n': (val: number, min: string): boolean => val >= parseInt(min, 10),
        'string': (val: string): boolean => typeof val === 'string',
        'number': (val: string): boolean => !isNaN(Number(val)),
    };

    const validatorErrors = {
        'required': (): string => `The ${label} is required`,
        'max': (max: string): string => `The ${label} may not be greater than ${max} characters.`,
        'min': (min: string): string => `The ${label} must be at least ${min} characters.`,
        'max-n': (max: string): string => `The ${label} may not be greater than ${max}.`,
        'min-n': (min: string): string => `The ${label} must be at least ${min}.`,
        'string': (): string => `The ${label} must be a string`,
        'number': (): string => `The ${label} must be a number`,
    };

    const errors: Array<string> = [];

    rules.forEach(rule => {
        const [ruleName, ruleParam] = rule.includes(':')
            ? rule.split(':')
            : [rule];

        if (validators[ruleName] && !validators[ruleName](value, ruleParam)) {
            errors.push(validatorErrors[ruleName](ruleParam))
        }
    });

    return errors.length === 0
        ? {valid: true, errors: []}
        : {valid: false, errors: errors}
}