<template>
    <div id="connection-window" v-if="$store.state.window !== 'Loading' && !$store.state.connectionOk">
        <div>Lost connection with the server. <br> Reconnecting...</div>
    </div>
    <div id="main">
        <component :is="$store.state.window"></component>
    </div>
</template>

<script lang="ts">

import CommandCentre from "@/components/windows/CommandCentre.vue";
import Create from "@/components/windows/Create.vue";
import JoinPlayer from "@/components/windows/JoinPlayer.vue";
import JoinTyrant from "@/components/windows/JoinTyrant.vue";
import Loading from "@/components/windows/Loading.vue";
import Main from "@/components/windows/Main.vue";
import Room from "@/components/windows/Room.vue";
import {defineComponent} from "vue";

export default defineComponent({
    name: "App",
    components: {
        Loading,
        Main,
        Create,
        Room,
        JoinPlayer,
        JoinTyrant,
        CommandCentre,
    },
    // data() {
    // },
    mounted() {
        // ads
    },
    methods: {},
    computed: {},
});

</script>

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
