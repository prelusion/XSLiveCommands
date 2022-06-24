<template>
    <div id="app">
        <input v-model="selectedCommand" list="commands">
        <datalist id="commands">
            <option v-bind:key="name" v-for="(name) in Object.keys(commands)" v-bind:value="name"></option>
        </datalist>
    </div>
    <Buttons :buttonConfig="buttonConfig"></Buttons>
</template>

<script lang="ts">
import {GameHandler} from "@/classes/game-handler";
import {SocketHandler} from "@/classes/socket-handler";
import Buttons from "@/components/Buttons.vue";
import {Commands} from "@/interfaces/command";
import {ensure} from "@/util/general";
import {defineComponent} from "vue";

export default defineComponent({
    name: "CommandCentre",
    components: {Buttons},
    props: {},
    data() {
        return {
            selectedCommand: "",
            commands: {} as Commands,
            buttonConfig: [
                {
                    window: "Main",
                    text: "Disconnect",
                    callback: async () => {
                        await SocketHandler.instance.leaveRoom();
                        await GameHandler.instance.resetState(ensure(SocketHandler.instance.room).scenario);
                    },
                },
                {
                    text: "Send",
                    callback: () => {
                        this.sendCommand();
                    },
                },
            ] as Array<ButtonConfig>,
        };
    },
    mounted() {
        this.commands = ensure(SocketHandler.instance.room).commands;
    },
    computed: {},
    methods: {
        sendCommand(): void {
            // temp
        },
    },
    watch: {},
});

</script>

<style scoped lang="scss">
button {
    padding: 5px;
}

input {
    padding: 4px;
}
</style>
