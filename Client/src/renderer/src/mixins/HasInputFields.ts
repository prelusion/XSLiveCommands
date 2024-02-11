import InputField from '../components/forms/InputField.vue';

import {defineComponent} from 'vue';

function getAllInputs(
    refs: Record<string, unknown>,
    refKeys: Array<string> | null = null
): Array<typeof InputField> {
    if (!Array.isArray(refKeys) && refKeys === null) {
        refKeys = Object.keys(refs)
            .filter((key: string) => key.startsWith('input'));
    }

    const inputs: Array<typeof InputField> = [];

    refKeys.forEach((childKey: string): void => {
        const child = refs[childKey] as typeof InputField | Array<typeof InputField>;

        const children = Array.isArray(child)
            ? child
            : [child];

        children.forEach((c) => inputs.push(c));
    });

    return inputs;
}


export default defineComponent({
    name: 'HasInputFields',
    data() {
        return {}
    },
    methods: {
        validateInputs(): boolean {
            return getAllInputs(this.$refs)
                .every((c: typeof InputField) => c.validate());
        },
        clearInputs(): void {
            getAllInputs(this.$refs)
                .forEach((c: typeof InputField) => c.clear())
        },
        focus(ref: string): void {
            const c: typeof InputField = getAllInputs(this.$refs, [ref])[0];

            c.focus();
        }
    },
});