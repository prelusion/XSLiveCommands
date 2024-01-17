<template>
    <div class="input-container">
        <label :for="inputId">{{ label }}</label>
        <input :id="inputId" class="input" :type="type" :placeholder="placeholder" v-model="inputValue"
               @input="checkValidity"/>
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
    </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import {validateRules} from "../../util/formRules";

export default defineComponent({
    name: "InputField",
    props: {
        label: {
            type: String,
            required: true
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
            type: String,
            default: ''
        },
        rules: {
            type: Array as PropType<Array<string>>,
            default: () => [],
        },
    },
    data() {
        return {
            inputValue: ''
        };
    },
    computed: {
        inputId() {
            return `input-${this._uid}`;
        }
    },
    methods: {
        checkValidity() {
            const conditionsMet = validateRules(this.rules, this.inputValue);
            console.log(conditionsMet);

        },
    }
});
</script>

<style>
.input-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.input {
    padding: 6px;
    border: 1px solid #111;
    border-radius: 5px;
    width: 100%;
    box-sizing: border-box;
    font-size: 16px;
}

.error-msg {
    margin-top: 3px;
    color: red;
}
</style>