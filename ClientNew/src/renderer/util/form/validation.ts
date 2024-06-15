import InputField from "@renderer/components/InputField.vue";


export function validateInputs(inputFields: (typeof InputField | null)[]): boolean {
    return inputFields
        .filter((c): c is typeof InputField => c !== null)
        .every(c => c.validate());
}

export function clearInputs(inputFields: (typeof InputField | null)[]): void {
    inputFields
        .filter((c): c is typeof InputField => c !== null)
        .forEach((c: typeof InputField) => c.clear());
}
