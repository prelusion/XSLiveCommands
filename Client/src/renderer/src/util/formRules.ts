export function validateRules(rules: string[], value: unknown): [boolean, Array<string>] {
    const validators = {
        'required': (val: string): boolean => val !== null && val !== undefined && val !== '',
        'max': (val: string, max: string): boolean => val.length <= parseInt(max, 10),
        'min': (val: string, min: string): boolean => val.length >= parseInt(min, 10),
        'max-n': (val: number, max: string): boolean => val <= parseInt(max, 10),
        'min-n': (val: number, min: string): boolean => val >= parseInt(min, 10),
        'string': (val: string): boolean => typeof val === 'string',
        'number': (val: string): boolean => !isNaN(Number(val)),
    };

    const validatorErrors = {
        'required': (): string => 'This field is required',
        'max': (val: string, max: string): string => 'This field cannot contain more than `' + max + '` characters. `' + val.length + '` was given',
        'min': (val: string, min: string): string => 'This field cannot contain less than `' + min + '` characters. `' + val.length + '` was given',
        'max-n': (val: number, max: string): string => 'This field cannot be larger than`' + max + '`. The number `' + val + '` was given',
        'min-n': (val: number, min: string): string => 'This field cannot be less than`' + min + '`. The number `' + val + '` was given',
        'string': (val: string): string => 'This field must be a string `' + val + '` is not a correct input',
        'number': (val: string): string => 'This field must be a number `' + val + '` is not a correct input',
    };

    const errors = [] as Array<string>;
    rules.forEach(rule => {
        const [ruleName, ruleParam] = rule.includes(':') ? rule.split(':') : [rule];
        if (validators[ruleName] && !validators[ruleName](value, ruleParam)) {
            errors.push(validatorErrors[ruleName](value, ruleParam))
        }
    });

    return errors.length === 0
        ? [true, []]
        : [false, errors]
}
