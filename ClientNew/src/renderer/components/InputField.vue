<template>
    <div class="custom-input-container">
        <label :for="inputId">{{ label }}</label>
        <div class="custom-input-wrapper">
            <input
                ref="inputField"
                class="custom-input"
                v-model="modelValue"
                :id="inputId"
                :type="type"
                :placeholder="placeholder"
                :class="{ 'custom-input-error': errorMessages.length }"
                @input="onInputEvent"
            />
        </div>
        <div v-for="(error, index) in errorMessages" :key="index" class="error-msg">
            {{ error }}
        </div>
        <div id="error-msg" v-if="errorMsg" v-html="errorMsg"></div>
    </div>
</template>

<script setup lang="ts">
import {ref, reactive, toRaw, onMounted, computed, getCurrentInstance, watch, PropType} from 'vue';
import {validateRules} from '@renderer/util/form/form-rules';
import {ensure} from "../../shared/src/util/general";

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    label: {
        type: String,
    },
    type: {
        type: String,
        default: 'text',
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
});
const modelValue = defineModel();

const emit = defineEmits([
    'update:modelValue',
    'onValueUpdated'
]);

const inputField = ref<HTMLInputElement | null>(null);
const inputValue = ref('');
const errorMessages = reactive<Array<string>>([]);
const timeout = ref(-1);

const instance = getCurrentInstance();

const inputId = computed(() => `input-${instance?.uid}`);

onMounted(() => {
    validate(false);
});

const onInputEvent = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = props.type === 'checkbox' ? target.checked : target.value;
    emit('update:modelValue', toRaw(value));
};

const checkValidity = () => {
    clearTimeout(timeout.value);

    timeout.value = setTimeout(validate, props.debounce) as unknown as number;
};

const validate = (error: boolean = true) => {
    clearTimeout(ensure(timeout.value));
    const formResult = validateRules(props.rules, props.label ?? props.name, inputValue.value);
    emit('onValueUpdated', inputValue.value);
    if (error) {
        errorMessages.length = 0;
        if (formResult.errors) errorMessages.push(...formResult.errors);
    }
    return formResult.valid;
};

const clear = () => {
    inputValue.value = '';
};

const focus = () => {
    inputField.value?.focus();
};
</script>

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
</style>
