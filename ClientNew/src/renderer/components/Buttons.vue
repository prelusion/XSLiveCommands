<template>
    <div
        :style="{
            position: positionClass,
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

<script lang="ts">
import {defineComponent, PropType, StyleValue} from "vue";
import {ButtonConfig} from "../types/buttons";

export default defineComponent({
    name: "Buttons",
    components: {},
    props: {
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
            default: () => {},
        }
    },
    // data() {
    // },
    // mounted() {
    // },
    computed: {
        positionClass() {
            return this.position === 'fixed'
                ? 'fixed'
                : 'relative';
        },
    },
    methods: {
        async clickedButton(index: number) {
            const config = this.buttonConfig[index];
            if (config.callback) {
                await config.callback();
            }
            if (config.route) {
                this.$router.replace({ name: config.route });
            }
        },
    },
    watch: {},
});

</script>

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
