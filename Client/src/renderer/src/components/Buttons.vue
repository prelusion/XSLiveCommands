<template>
    <div id="buttons" :class="[{ 'row-reverse': reverse }, positionClass]">
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
import {defineComponent, PropType} from "vue";
import {ButtonConfig} from "../interfaces/buttons";

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
        position: {
            type: String,
            default: 'fixed'
        },
    },
    mounted() {
        // Runs
    },
    computed: {
        positionClass() {
            return this.position === 'fixed' ? 'fixed' : 'relative';
        },
    },
    methods: {
        async clickedButton(index: number) {
            const config = this.buttonConfig[index];
            if (config.callback) {
                await config.callback();
            }
            if (config.window) {
                this.$store.commit("changeWindow", config.window);
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
    flex-direction: row;
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

.fixed {
    position: fixed;
}

.relative {
    position: relative;
}

#buttons.row-reverse {
    flex-direction: row-reverse;
}

</style>
