<template>
    <div id="main">
        <component :is="$store.state.window"></component>
    </div>
</template>

<script lang="ts">

import {defineComponent} from "vue";
import Main from "@/components/windows/Main.vue";
import Create from "@/components/windows/Create.vue";
import Join from "@/components/windows/Join.vue";
import Loading from "@/components/windows/Loading.vue";
import Room from "@/components/windows/Room.vue";

export default defineComponent({
    name: "App",
    components: {
        Loading,
        Main,
        Create,
        Room,
        Join,
    },
    // data() {
    // },
    mounted() {
        // ads
    },
    methods: {
    },
    computed: {
    },
})

</script>

<style lang="scss">
$height: 240px;
$padding: 20px;

body {
    min-height: $height;
    margin: 0;
    font-family: Calibri,serif;
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
