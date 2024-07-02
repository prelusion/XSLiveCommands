<script setup lang="ts">
import {getCurrentInstance, onMounted, PropType, ref, watch} from 'vue';
import {validateRules} from '@renderer/util/form/form-rules';

const {setTimeout, clearTimeout} = window;

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    label: {
        type: String,
    },
    subtext: {
        type: String,
        default: null,
    },
    type: {
        type: String,
        default: 'text',
    },
    list: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: '',
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
    },
    modelValue: {
        type: [String, Number, Boolean, Object, Array],
        required: false,
    },
});

/* Detect if the v-model was used on the input field - ChatGpt */
const isUsingVModel = ref(false);
watch(
    () => props.modelValue,
    (newValue) => {
        if (newValue !== undefined) {
            isUsingVModel.value = true;
        }
    },
    {immediate: true}
);

const modelValue = defineModel();

const emit = defineEmits(['update:modelValue']);

const inputField = ref<HTMLInputElement | null>(null);
const errorMessages = ref([] as string[]);

/* Unique identifier for each InputElement */
const instance = getCurrentInstance();
const inputId = `input-${instance?.uid}`;

onMounted(() => {
    validate(false);
});

let timeout = -1;
const onInputEvent = () => {
    if (isUsingVModel.value === false)
        return;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
        validate();

        emit('update:modelValue', modelValue.value);
    }, props.debounce);
};

const validate = (updateErrors: boolean = true) => {
    const formResult = validateRules(props.rules, props.label ?? props.name, modelValue.value);

    if (updateErrors) {
        errorMessages.value = [];

        if (!formResult.valid) {
            errorMessages.value.push(...formResult.errors);
        }
    }

    return formResult.valid;
};

const clear = () => {
    modelValue.value = '';
};

const focus = () => {
    inputField.value?.focus();
};

/* Allow functions to be called from outside other components */
defineExpose({validate, clear, focus})
</script>

<template>
    <div class="custom-input-container">
        <label v-show="!!label" :for="inputId">{{ label }}</label>
        <div class="custom-input-wrapper">
            <input
                ref="inputField"
                class="custom-input"
                v-model="modelValue"
                :id="inputId"
                :list="list"
                :type="type"
                :placeholder="placeholder"
                :class="{ 'custom-input-error': errorMessages.length }"
                @input="onInputEvent"
            />
        </div>
        <div v-if="subtext" class="small-text">
            {{ subtext }}
        </div>
        <div v-for="(error, index) in errorMessages" :key="index" class="error-msg">
            {{ error }}
        </div>
        <div id="error-msg" v-if="errorMsg" v-html="errorMsg"></div>
    </div>
</template>

<style>
.custom-input-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: start;
}

.custom-input-wrapper {
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
}

.custom-input {
    border: 1px solid #767676;
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
    margin-top: -3px;
    font-size: 15px;
    color: red;
}

.small-text {
    font-size: 12px;
    color: gray;
    display: inline-block;
    line-height: 12px;
}
</style>
