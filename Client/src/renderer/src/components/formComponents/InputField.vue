<template>
    <div class="custom-input-container">
        <label :for="inputId">{{ label }}</label>
        <input :id="inputId" class="custom-input" :type="type" :placeholder="placeholder" v-model="inputValue"
               :class="errorMessages.length === 1 ? 'custom-input-error' : ''"
               @input="checkValidity"/>
         <div v-for="(error, index) in errorMessages" :key="index" class="error-msg">
            {{ error }}
        </div>
        <div id="error-msg" v-if="errorMsg" v-html="errorMsg"></div>
    </div>
</template>

<script lang="ts">
import {defineComponent, getCurrentInstance, PropType} from "vue";
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
            type: Array as PropType<Array<string>>,
            default: () => [],
        },
        rules: {
            type: Array as PropType<Array<string>>,
            default: () => [],
        },
    },
    data() {
        return {
            inputValue: '',
            errorMessages: [] as Array<string>
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
            const [conditionsMet, errors] = validateRules(this.rules, this.inputValue);
            this.$emit('updateValue', this.inputValue);
            this.$emit('validationStatus', conditionsMet);
            this.errorMessages = errors;

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
    gap: 5px;
}

.custom-input {
    border: 1px solid #111;
    border-radius: 2px;
    width: 100%;
    padding: 5px;
    box-sizing: border-box;
    font-size: 16px;
}

.custom-input-error {
    border: 1px solid red;
}

.error-msg {
    margin-top: 3px;
    color: red;
}
</style>