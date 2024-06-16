<template>
    <div class="container">
        <p>The JSON configuration file cannot be read, do you want to reset it?</p>
        <div class="input-container">
            <button class="submit-button" @click="reset">Reset</button>
            <button class="submit-button" @click="exit">Exit</button>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
    name: "ConfigReset",
    computed: {
    },
    methods: {
        reset() {
            window.config.resetConfig();

            this.$router.go(0);
        },
        exit() {
            window.manager.exit();
        },
    }
});
</script>

<style>
.container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.input-container {
    display: flex;
    flex-direction: row;
    align-content: space-between;
    gap: 10px;
}
</style>
