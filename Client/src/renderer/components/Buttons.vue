<script setup lang="ts">
import {PropType, StyleValue} from "vue";
import {ButtonConfig} from "../types/buttons";
import {useRouter} from "vue-router";

const router = useRouter();

const props = defineProps({
    buttonConfig: {
        type: Array as PropType<Array<ButtonConfig>>,
        default: () => [],
        required: true,
    },
    reverse: {
        type: Boolean,
        default: false
    },
    direction: {
        type: String as PropType<StyleValue>,
        default: 'row'
    },
    position: {
        type: String,
        default: 'fixed'
    },
    styles: {
        type: Object,
        default: () => new Object(),
    }
});

const clickedButton = async (index: number) => {
    const config = props.buttonConfig[index];
    if (config.callback) {
        await config.callback();
    }

    if (config.route) {
        await router.replace({name: config.route});
    }
};
</script>

<template>
    <div
        :style="{
            position: position === 'fixed' ? 'fixed' : 'relative',
            flexDirection: direction,
            ...styles,
        }"
        id="buttons"
    >
        <button
            v-for="(config, index) in buttonConfig"
            v-bind:key="index"
            v-bind:disabled="config.disabled && config.disabled() || false"
            @click="clickedButton(index)"
        >
            {{ config.text }}
        </button>
    </div>
</template>

<style scoped lang="scss">
$padding: 20px - 10;

#buttons {
    display: flex;
    //flex-direction: row;
    justify-content: space-between;
    width: 100%;
    bottom: 0;
    left: 0;
    padding: 0 $padding $padding $padding;

    button {
        width: 40%;
        padding: 10px;
        margin: 10px;
    }
}
</style>
