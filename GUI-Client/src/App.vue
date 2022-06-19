<template>
    <div id="main">
        <KeepAlive>
            <component :is="$store.state.window"></component>
        </KeepAlive>
    </div>
</template>

<script lang="ts">

import {defineComponent} from "vue";
import MainWindow from "@/components/windows/MainWindow.vue";
import CreateWindow from "@/components/windows/CreateWindow.vue";
import JoinWindow from "@/components/windows/JoinWindow.vue";
import LoadingWindow from "@/components/windows/LoadingWindow.vue";
import CreatedWindow from "@/components/windows/CreatedWindow.vue";

export default defineComponent({
    name: "App",
    components: {
        LoadingWindow,
        MainWindow,
        CreateWindow,
        CreatedWindow,
        JoinWindow,
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

body {
    min-height: $height;
    margin: 0;
}

#main {
    position: relative;
    min-height: $height;
    height: 100vh;
    padding: 40px;
}

* {
    box-sizing: border-box;
}
</style>
