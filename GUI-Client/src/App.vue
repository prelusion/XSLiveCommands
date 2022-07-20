<template>
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
    font-family: Calibri, serif;
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
