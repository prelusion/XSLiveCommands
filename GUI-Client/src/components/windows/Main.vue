<template>
    <div>
        <div class="">
            SteamID: {{ steamId }}
        </div>
        <div id="displayMessage">
            {{ message }}
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
            message: "",
        };
    },
    mounted() {
        // this.$store.commit("changeWindow", "Create");
        const data = this.$store.state.data as {message: string} | null;
        if (data !== null) {
            this.message = data.message;
            this.$store.state.data = null;
        }
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
#displayMessage {
    margin-top: 8vh;
    text-align: center;
    color: #ce3d3d;
}
</style>
