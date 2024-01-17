export function validateRules(rules: string[], value: unknown): boolean {
    const validators = {
        'required': (val: string): boolean => val !== null && val !== undefined && val !== '',
        'max': (val: string, max: string): boolean => val.length <= parseInt(max, 10),
        'min': (val: string, min: string): boolean => val.length >= parseInt(min, 10),
        'string': (val: string): boolean => typeof val === 'string',
        'number': (val: string): boolean => !isNaN(Number(val)),
    };

    return rules.every(rule => {
        const [ruleName, ruleParam] = rule.includes(':') ? rule.split(':') : [rule];
        return validators[ruleName] ? validators[ruleName](value, ruleParam) : true;
    });
}
