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
                <button @click="selectedCommand = ''"
                        id="clear-command-button"
                        title="Clear the command selection text box"
                >
                    Clear
                </button>

                <datalist id="commands">
                    <option v-bind:key="name" v-for="(name) in Object.keys(commands)" v-bind:value="name"></option>
                </datalist>
            </div>

            <div id="params">
                <div class="header">
                    Specify Arguments:
                </div>
                <table>
                    <tr class="param-entry" v-bind:key="index" v-for="(paramName, index) in paramNames">
                        <td>
                            {{ paramName }}
                            <span v-if="getCommandParameterPlaceholderText(index) === ''">*</span>
                        </td>
                        <td>
                            <input v-bind:type="commandInputType(index)"
                                   v-bind:placeholder="getCommandParameterPlaceholderText(index)"
                                   v-bind:id="`q${index}`"
                                   v-model="inputParams[index]"
                            >
                        </td>
                    </tr>
                </table>
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
import {
    CommandParamConfig,
    CommandTemplates,
    Param
} from "@/interfaces/command";
import {ensure} from "@/util/general";
import {defineComponent} from "vue";
import {CommandEvent} from "@/interfaces/general";
import {QueueHandler} from "@/classes/queue-handler";
import {ParamType} from "@/enums/commands";

export default defineComponent({
    name: "CommandCentre",
    components: {Buttons},
    props: {},
    data() {
        return {
            ParamType,

            commands: {} as CommandTemplates,
            numberOfConnectedClients: 0,

            inputParams: [] as Array<number | string | boolean | undefined>,
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
        commandId(): string | undefined {
            return this.commands[this.selectedCommand]?.funcName;
        },
        commandParams(): Array<CommandParamConfig> {
            return this.commands[this.selectedCommand]?.params ?? [];
        },
        paramNames(): Array<string> {
            return Object.values(this.commandParams).map((e): string => {
                return e.name;
            });
        }
    },
    methods: {
        ensure,
        copyRoomId() {
            window.clipboard.write(ensure(SocketHandler.instance.room).id);
        },
        getCommandParameter(index: number): CommandParamConfig {
            return this.commandParams[index];
        },
        getCommandParameterDefault(index: number): string {
            return (this.getCommandParameter(index)?.default ?? '').toString();
        },
        getCommandParameterPlaceholderText(index: number): string {
            const d = this.getCommandParameterDefault(index);
            return d ? 'default: ' + d : ''
        },
        getCommandParameterType(index: number): ParamType {
            const TYPES: Record<string, ParamType | undefined> = {
                'int': ParamType.INT,
                'float': ParamType.FLOAT,
                'bool': ParamType.BOOL,
                'string': ParamType.STRING,
            }
            const paramType = TYPES[this.getCommandParameter(index).type];

            if (paramType === undefined) {
                const paramName = this.getCommandParameter(index).name;
                throw TypeError(`Unknown type in commands. (param: '${paramName}', index: ${index})`);
            }
            return paramType
        },
        commandInputType(index: number): string {
            const TYPES: Record<ParamType, string | undefined> = {
                [ParamType.INT]: 'number',
                [ParamType.FLOAT]: 'number',
                [ParamType.BOOL]: 'checkbox',
                [ParamType.STRING]: 'text',
            }
            const type = TYPES[this.getCommandParameterType(index)];

            if (type === undefined) {
                const paramName = this.getCommandParameter(index).name;
                throw TypeError(`Invalid input field type (${type}). (param: '${paramName}', index: ${index})`);
            }
            return type;
        },
        roomConnectionUpdate(n: number) {
            this.numberOfConnectedClients = n;
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
            const values: Array<Param> = [];

            for (let i = 0; i < this.commandParams.length; ++i) {
                let value = this.inputParams[i];
                const param = this.commandParams[i];
                const type = param.type;
                const default_ = param.default;

                // A checkbox loaded initially (not clicked) is undefined even though it should be false.
                if (type.toLowerCase() === 'bool' && value === undefined) {
                    value = false
                }
                
                if (value === undefined && default_ === undefined) {
                    return this.setError("Please enter numbers for all required arguments before sending the command!");
                } else {
                    values.push({
                        type: this.getCommandParameterType(i),
                        data: (value ?? default_) as string | number | boolean,
                        name: this.commandParams[i].name,
                    });
                }
            }

            this.setText("Command Sent!");

            SocketHandler.instance.sendCommand({
                funcName: this.commandId,
                params: values
            });
        },
    },
    watch: {
        commandId() {
            this.text = [];
            this.inputParams = [];
        },
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

            #clear-command-button {
                margin-left: 4px;
            }
        }

        #params {
            margin-top: 10px;

            .param-entry {
                margin: 4px 0;

                td:first-child {
                    text-transform: capitalize;
                    padding-right: 10px;
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

input, button {
    padding: 4px;
}
</style>
