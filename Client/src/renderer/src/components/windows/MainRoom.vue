<template>
    <div class="main-wrapper">
        <div class="">
            Name: {{ steamName }}
        </div>
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
import {GameHandler} from "../../classes/game-handler";
import Buttons from "../../components/Buttons.vue";
import {defineComponent} from "vue";
import {changeTitle} from "../../util/general";
import {ButtonConfig} from "../../interfaces/buttons";

export default defineComponent({
    name: "MainRoom",
    components: {Buttons},
    props: {},
    data() {
        return {
            steamId: '' as string,
            steamName: '' as string,
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
        window.manager.resize(600, 325);

        // this.$store.commit("changeWindow", "Create");
        const data = this.$store.state.data as {message: string} | null;
        if (data !== null) {
            this.message = data.message;
            this.$store.state.data = null;
        }

        this.steamId = GameHandler.instance.steamId;
        this.steamName = GameHandler.instance.steamName;
    },
    computed: {},
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
