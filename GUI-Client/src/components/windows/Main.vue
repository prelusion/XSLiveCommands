<template>
    <div>
        <div class="">
            SteamID: '{{ steamId }}'
        </div>
        <Buttons :buttonConfig="buttonConfig"></Buttons>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Buttons from "@/components/Buttons.vue";
import {GameHandler} from "@/classes/game-handler";

export default defineComponent({
    name: "MainRoom",
    components: {Buttons},
    props: {},
    data() {
        return {
            buttonConfig: [
                {
                    window: 'JoinWindow',
                    text: 'Join a room',
                },
                {
                    window: 'CreateWindow',
                    text: 'Create a room',
                },
            ] as Array<ButtonConfig>,
        }
    },
    mounted() {
        // Execute on creation
    },
    computed: {
        steamId(): string {
            return GameHandler.instance.steamId;
        }
    },
    methods: {},
    watch: {}
})

</script>

<style scoped lang="scss">

</style>
