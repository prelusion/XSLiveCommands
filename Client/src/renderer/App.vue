<script setup lang="ts">
import {useMainStore} from "@store/main";
import {useRouter} from "vue-router";
import {Route} from "@renderer/router/routes";

const store = useMainStore();
const router = useRouter();

/* Disable history states, so the back and forth buttons canNOT be used */
router.push = () => {
    throw new Error('Please use `router.replace(...)` instead of `router.push(...)`');
}

/* Send user back to the loading screen when the app is restarted */
window.electron.ipcRenderer.on('restart-finished-loading', () => {
    router.replace({name: Route.LOADING});
});

</script>

<template>
    <div
        v-if="router.currentRoute.value.name !== Route.LOADING && !store.$state.connectionOk"
        id="connection-window"
    >
        <div>Lost connection with the server. <br> Reconnecting...</div>
    </div>

    <router-view v-slot="{ Component }">
        <component :is="Component"/>
    </router-view>
</template>

<style lang="scss">
$height: 240px;
$padding: 20px;

body {
    min-height: $height;
    margin: 0;
    font-family: "Segoe UI", serif;
}

#connection-window {
    position: fixed;
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
    background-color: rgb(212, 213, 213);
    opacity: 0.8;
    z-index: 100;

    div {
        padding-top: 30vh;
        text-align: center;
        opacity: 1;
        font-weight: bold;
    }
}

#main {
    position: relative;
    min-height: $height;
    height: 100vh;
    padding: $padding;
}

* {
    box-sizing: border-box;
}
</style>
