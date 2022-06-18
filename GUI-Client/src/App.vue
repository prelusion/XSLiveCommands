<template>
    <div>
        SteamID: '{{ steamId }}'
    </div>
</template>

<script lang="ts">

import {defineComponent} from "vue";


export default defineComponent({
    name: "App",
    components: {},
    data() {
        return {
            steamId: '',
        }
    },
    mounted() {
        window.regedit.getSteamId().then(steamId => this.steamId = steamId);
    },
    methods: {
    },
    computed: {

    },
})

</script>

<style lang="scss">

</style>
