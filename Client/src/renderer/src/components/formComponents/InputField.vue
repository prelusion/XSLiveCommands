<template>
    <div class="custom-input-container">
        <label :for="inputId">{{ label }}</label>
        <input :id="inputId" class="custom-input" :type="type" :placeholder="placeholder" v-model="inputValue"
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
            this.$emit('updateValue', this.inputValue);
            this.$emit('validationStatus', conditionsMet);

        },
    },
    watch: {
        inputValue() {
            this.checkValidity();
        }
    },
});
</script>

<style>
.custom-input-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.custom-input {
    border: 1px solid #111;
    border-radius: 2px;
    width: 100%;
    padding: 5px;
    box-sizing: border-box;
    font-size: 16px;
}

.error-msg {
    margin-top: 3px;
    color: red;
}
</style>