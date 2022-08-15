<template>
    <div class="main-wrapper">
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
import {changeTitle} from "@/util/general";

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
                    text: "Join as Player / Spectator",
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
        changeTitle('');
        window.manager.resize(600, 300);

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
.main-wrapper {
    position: relative;

    #displayMessage {
        margin-top: 8vh;
        text-align: center;
        color: #ce3d3d;
    }

    #version {
        position: absolute;
        top: 0;
        right: 0;
    }
}

</style>
