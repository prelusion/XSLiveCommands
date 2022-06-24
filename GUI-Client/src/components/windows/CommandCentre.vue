<template>
    <div id="app">
        Choose Command: <br>
        <input v-model="selectedCommand" list="commands">
        <datalist id="commands">
            <option v-bind:key="name" v-for="(name) in Object.keys(commands)" v-bind:value="name"></option>
        </datalist>
        <br>

        Specify Arguments: <br>
        <div v-bind:key="index" v-for="(param, index) in commandParams">
            <input type="number" v-model="inputParams[index]"> <label>{{ param }}</label>
        </div>
        <div v-if="error" id="loading">
            <span id="error" v-html="text.join('<br>')"></span>
        </div>
        <div v-else>
            <span id="msg" v-html="text.join('<br>')"></span>
        </div>
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
            commands: {} as Commands,
            error: true,
            inputParams: [] as Array<number>,
            selectedCommand: "",
            text: [] as Array<string>,
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
    computed: {
        commandId(): number | undefined {
            return this.commands[this.selectedCommand]?.id;
        },
        commandParams(): string[] {
            return this.commands[this.selectedCommand]?.params ?? [];
        },
    },
    methods: {
        sendCommand(): void {
            if(this.commandId === undefined) {
                this.error = true;
                this.text = ["Please choose a valid command"];
                return;
            }
            valid: {
                for (let i = 0; i < this.commandParams.length; ++i) {
                    if (!this.inputParams[i]) {
                        this.error = true;
                        this.text = ["Please enter numbers for all the arguments before sending the command!"];
                        break valid;
                    }
                }
                this.error = false;
                this.text = ["Command Sent!"];
                // Todo: implement this
                console.log("send dummy req", "commandId:", this.commandId, "params:", this.inputParams);
            }
        },
    },
    watch: {
        commandId() {
            this.text = [];
            this.inputParams = [];
        }
    },
});

</script>

<style scoped lang="scss">
button {
    padding: 5px;
}

input {
    padding: 4px;
}

#error {
    color: red;
    padding: 4px;
}

#msg {
    padding: 4px;
}
</style>
