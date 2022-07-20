<template>
    <div>
        <div class="">
            SteamID: {{ steamId }}
        </div>
        <Buttons :buttonConfig="buttonConfig"></Buttons>
    </div>
</template>

<script lang="ts">
import {GameHandler} from "@/classes/game-handler";
import Buttons from "@/components/Buttons.vue";
import {defineComponent} from "vue";

export default defineComponent({
    name: "MainRoom",
    components: {Buttons},
    props: {},
    data() {
        return {
            buttonConfig: [
                {
                    window: "Create",
                    text: "Create a Room",
                },
                {
                    window: "JoinPlayer",
                    text: "Join as Player",
                },
                {
                    window: "JoinTyrant",
                    text: "Join as Tyrant",
                },
            ] as Array<ButtonConfig>,
        };
    },
    mounted() {
        // this.$store.commit("changeWindow", "Create");
    },
    computed: {
        steamId(): string {
            return GameHandler.instance.steamId;
        },
    },
    methods: {},
    watch: {},
});

</script>

<style scoped lang="scss">
</style>
