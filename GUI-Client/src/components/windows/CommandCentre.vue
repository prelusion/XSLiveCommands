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
            <label><input type="number" v-model="inputParams[index]"> {{ param }} </label>
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
import {CommandEvent} from "@/interfaces/general";
import {QueueHandler} from "@/classes/queue-handler";

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

        const socket = ensure(SocketHandler.instance.socket);
        // Todo: Maybe add (id/scenario/number of connections etc.) to display?
        // socket.on("room-connection-update", (n: number) => {
        //     this.numberOfConnectedClients = n;
        // });

        socket.on("event", this.eventRegistered);
    },
    unmounted() {
        const socket = ensure(SocketHandler.instance.socket);
        // socket.off("room-connection-update", this.roomConnectionUpdate);
        socket.off("event", this.eventRegistered);
    },
    computed: {
        commandId(): number | undefined {
            return this.commands[this.selectedCommand]?.id;
        },
        commandParams(): number[] {
            return this.commands[this.selectedCommand]?.params ?? [];
        },
    },
    methods: {
        // roomConnectionUpdate(n: number) {
        //     this.numberOfConnectedClients = n;
        // },
        eventRegistered(commandEvent: CommandEvent) {
            console.log("Event registered!");
            console.log(commandEvent);
            QueueHandler.instance.enqueue(commandEvent);
        },
        sendCommand(): void {
            if(this.commandId === undefined) {
                this.error = true;
                this.text = ["Please choose a valid command"];
                return;
            }
            valid: {
                for (let i = 0; i < this.commandParams.length; ++i) {
                    // Todo: Doesn't support '0'. Even though it should (sending only stone as resources, requires 0 of all other 3)
                    if (!this.inputParams[i]) {
                        this.error = true;
                        this.text = ["Please enter numbers for all the arguments before sending the command!"];
                        break valid;
                    }
                }
                this.error = false;
                this.text = ["Command Sent!"];

                SocketHandler.instance.sendCommand({
                    id: this.commandId,
                    params: this.inputParams,
                });
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
