<template>
    <div id="view">
        <div id="info">
            <table>
                <tr>
                    <td>Room ID:</td>
                    <td>{{ ensure(SocketHandler.room).id }}</td>
                    <td>
                        <button @click="copyRoomId()">Copy</button>
                    </td>
                </tr>
                <tr>
                    <td>Scenario:</td>
                    <td>{{ ensure(SocketHandler.room).scenario }}</td>
                </tr>
                <tr>
                    <td>Number of connected players:</td>
                    <td> {{ numberOfConnectedClients }}</td>
                </tr>
            </table>
        </div>
        <div id="command-centre">
            <div id="command">
                <div class="header">
                    Choose Command:
                </div>
                <input v-model="selectedCommand" list="commands">

                <datalist id="commands">
                    <option v-bind:key="name" v-for="(name) in Object.keys(commands)" v-bind:value="name"></option>
                </datalist>
            </div>

            <div id="params">
                <div class="header">
                    Specify Arguments:
                </div>
                <div class="param-entry" v-bind:key="index" v-for="(paramName, index) in paramNames">
                    <label>
                        <input type="number" v-model="inputParams[index]">
                        {{ paramName }}
                        <span v-if="paramIsObject(index) && ensureParamIsObject(index).required">*</span>
                    </label>
                </div>
            </div>

            <div id="text">
                <div v-if="error">
                    <span id="error" v-html="text.join('<br>')"></span>
                </div>
                <div v-else>
                    <span id="msg" v-html="text.join('<br>')"></span>
                </div>
            </div>
        </div>
    </div>
    <Buttons :buttonConfig="buttonConfig"></Buttons>
</template>

<script lang="ts">
import {GameHandler} from "@/classes/game-handler";
import {SocketHandler} from "@/classes/socket-handler";
import Buttons from "@/components/Buttons.vue";
import {Commands, CommandTemplateParamConfig, CommandTemplateParamConfigObject} from "@/interfaces/command";
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
            numberOfConnectedClients: 0,

            inputParams: [] as Array<number | string | undefined>,
            selectedCommand: "",

            text: [] as Array<string>,
            error: true,

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
        const room = ensure(SocketHandler.instance.room);

        const socket = ensure(SocketHandler.instance.socket);

        this.commands = room.commands;
        this.numberOfConnectedClients = room.numberOfConnections;

        socket.on("room-connection-update", this.roomConnectionUpdate);
        socket.on("event", this.eventRegistered);
    },
    unmounted() {
        const socket = ensure(SocketHandler.instance.socket);
        socket.off("room-connection-update", this.roomConnectionUpdate);
        socket.off("event", this.eventRegistered);
    },
    computed: {
        SocketHandler() {
            return SocketHandler.instance;
        },
        commandId(): number | undefined {
            return this.commands[this.selectedCommand]?.id;
        },
        commandParams(): Array<CommandTemplateParamConfig> {
            return this.commands[this.selectedCommand]?.params ?? [];
        },
        paramNames(): Array<string> {
            return Object.values(this.commandParams).map((e): string => {
                if (typeof e === "string") {
                    return e;
                }
                return e.name;
            });
        }
    },
    methods: {
        ensure,
        roomConnectionUpdate(n: number) {
            this.numberOfConnectedClients = n;
        },
        paramIsObject(index: number): boolean {
            return typeof this.commandParams[index] !== "string";
        },
        ensureParamIsObject(index: number): CommandTemplateParamConfigObject {
            const param = this.commandParams[index];
            if (typeof param === "string") {
                throw TypeError("Param is type string whilst it should never be string.");
            }
            return param;
        },
        setDefault(): void {
            for (let i = 0; i < this.commandParams.length; ++i) {
                const param = this.commandParams[i];

                if (typeof param !== "string" && param.default !== undefined) {
                    this.inputParams[i] = param.default;
                } else {
                    this.inputParams[i] = undefined;
                }
            }
        },
        setError(...strings: Array<string>): void {
            this.error = true;
            this.text = strings;
        },
        setText(...strings: Array<string>): void {
            this.error = false;
            this.text = strings;
        },
        eventRegistered(commandEvent: CommandEvent) {
            console.log("Event registered!");
            console.log(commandEvent);
            QueueHandler.instance.enqueue(commandEvent);
        },
        sendCommand(): void {
            if (this.commandId === undefined) {
                return this.setError("Please choose a valid command");
            }

            for (let i = 0; i < this.commandParams.length; ++i) {
                const value = this.inputParams[i];
                const param = this.commandParams[i];

                console.log(typeof value,value,)

                if (typeof param !== "string") {
                    if ((value === undefined || value === '') && param.required) {
                        return this.setError("Please enter numbers for all required arguments before sending the command!");
                    }
                }
            }

            this.setText("Command Sent!");

            SocketHandler.instance.sendCommand({
                id: this.commandId,
                params: this.inputParams.map(e => typeof e === "number" ? e : 0)
            });
            this.setDefault();
        },
    },
    watch: {
        commandId() {
            this.text = [];
            this.inputParams = [];
        },
        selectedCommand() {
            this.setDefault();
        }
    },
});

</script>

<style scoped lang="scss">
#view {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    #command-centre {
        #command {
            margin-top: 10px;
        }

        #params {
            margin-top: 10px;

            .param-entry {
                margin-top: 3px;

                label {
                    text-transform: capitalize;
                }
            }
        }

        #text {
            #error {
                color: red;
            }

            // #msg {}
        }

        .header {
            margin-bottom: 3px;
        }
    }

    #info {
        border-bottom: 1px solid #b6b6b6;
        padding-bottom: 10px;
        
        table {
            tr {
                td:first-child {
                    text-align: right;
                }

                td:nth-child(2) {
                    padding-left: 10px;
                }
            }
        }
    }
}

input {
    padding: 4px;
}
</style>
