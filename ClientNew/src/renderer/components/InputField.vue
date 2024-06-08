<template>
    <div class="custom-input-container">
        <label :for="inputId">{{ label }}</label>
        <div class="custom-input-wrapper">
            <input
                ref="input-field"
                class="custom-input"
                v-model="inputValue"
                :id="inputId"
                :type="type"
                :placeholder="placeholder"
                :class="{'custom-input-error': errorMessages.length}"
                @input="() => checkValidity()"
                @blur="() => validate()"
            />
        </div>
        <div v-for="(error, index) in errorMessages" :key="index" class="error-msg">
            {{ error }}
        </div>
        <div id="error-msg" v-if="errorMsg" v-html="errorMsg"></div>
    </div>
</template>

<script lang="ts">
import {defineComponent, getCurrentInstance, PropType} from "vue";
import {validateRules} from "@renderer/util/formRules";

const {clearTimeout, setTimeout} = window;

export default defineComponent({
    name: "InputField",
    props: {
        name: {
            type: String,
            required: true,
        },
        label: {
            type: String,
        },
        type: {
            type: String,
            default: 'text'
        },
        placeholder: {
            type: String,
            default: ''
        },
        errorMsg: {
            type: Array as PropType<Array<string>>,
            default: () => [],
        },
        rules: {
            type: Array as PropType<Array<string>>,
            default: () => [],
        },
        debounce: {
            type: Number,
            default: 300,

        }
    },
    mounted() {
        /* Initial validation to check if initial state is valid */
        this.validate(false);
    },
    data() {
        return {
            inputValue: '',
            errorMessages: [] as Array<string>,
            timeout: -1 as number,
        };
    },
    computed: {
        inputId() {
            const instance = getCurrentInstance();
            return `input-${instance?.uid}`;
        }
    },
    methods: {
        checkValidity() {
            /* Input debounce */
            clearTimeout(this.timeout);

            this.timeout = setTimeout(this.validate, this.debounce);
        },
        validate(error: boolean = true) {
            const formResult = validateRules(this.rules, this.label ?? this.name, this.inputValue);

            this.$emit('onValueUpdated', this.inputValue);

            if (error) {
                this.errorMessages = formResult.errors ?? [];
            }

            return formResult.valid;
        },
        clear() {
            this.inputValue = '';
        },
        focus() {
            const input = this.$refs['input-field'] as HTMLInputElement;

            input.focus();
        }
    }
});
</script>

<style>
.custom-input-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: start;

    .custom-input-wrapper {
        width: 100%;
        height: 30px;
        display: flex;
        align-items: center;

        .custom-input {
            border: 1px solid #767676;
            border-radius: 2px;
            width: 100%;
            padding: 5px;
            box-sizing: border-box;
            font-size: 16px;

            &.custom-input-error {
                border: 1px solid red;
            }
        }

    }

    .error-msg {
        margin-top: -3px;
        font-size: 15px;
        color: red;
    }
}
</style>
