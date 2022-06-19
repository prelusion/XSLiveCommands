<template>
    <div id="main">
        <KeepAlive>
            <component :is="$store.state.window"></component>
        </KeepAlive>
    </div>
</template>

<script lang="ts">

import {defineComponent} from "vue";
import Main from "@/components/windows/Main.vue";
import Create from "@/components/windows/Create.vue";
import Join from "@/components/windows/Join.vue";
import Loading from "@/components/windows/Loading.vue";
import Created from "@/components/windows/Created.vue";

export default defineComponent({
    name: "App",
    components: {
        Loading,
        Main,
        Create,
        Created,
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
