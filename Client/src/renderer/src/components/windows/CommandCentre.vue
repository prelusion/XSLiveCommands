<template>
    <disconnect-button @disconnect="disconnect"/>
    <div id="view">
        <div id="info">
            <table>
                <tr>
                    <td>Room Code:</td>
                    <td>{{ ensure(SocketHandler.room).id }}</td>
                    <td>
                        <button @click="copyRoomId()">Copy</button>
                    </td>
                </tr>
                <tr>
                    <td>Map:</td>
                    <td>{{ ensure(SocketHandler.room).map }}</td>
                </tr>
                <tr>
                    <td>Players:</td>
                    <td> {{ numberOfConnectedClients }}</td>
                </tr>
            </table>
        </div>
        <div id="command-centre">
            <div id="command">
                <div id="command-selection">
                    <div id="command-top-order">
                        <div>
                            <input v-model="selectedCommand" list="commands" placeholder="Select Command">
                            <button @click="selectedCommand = ''"
                                    id="clear-command-button"
                                    title="Clear the command selection text box"
                            >
                                Clear
                            </button>
                        </div>

                        <datalist id="commands">
                            <option v-bind:key="name" v-for="(name) in Object.keys(commands)"
                                    v-bind:value="name"></option>
                        </datalist>
                    </div>

                    <div id="params">
                        <div class="header" v-if="commandParams?.length > 0">
                            Arguments:
                        </div>
                        <table>
                            <tr class="param-entry" v-bind:key="index" v-for="(_, index) in commandParams?.length ?? 0">
                                <td>
                                    <InputField
                                        ref="input"
                                        :name="getCommandParameter(index).name"
                                        :type="commandInputType(index)"
                                        :placeholder="getCommandParameterPlaceholderText(index)"
                                        :rules="getCommandRules(index)"
                                        @onValueUpdated="inputParams[index] = $event"
                                    />
                                </td>
                            </tr>
                        </table>
                    </div>
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
import {GameHandler} from "../../classes/game-handler";
import {SocketHandler} from "../../classes/socket-handler";
import Buttons from "../../components/Buttons.vue";
import {
    CommandEvent,
    CommandParamConfig,
    CommandTemplates,
    Param,
    ParamType
} from "../../../../shared/src/types/command";
import {changeTitle} from "../../util/general";
import {defineComponent} from "vue";
import {QueueHandler} from "../../classes/queue-handler";
import {ButtonConfig} from "../../types/buttons";
import {ensure} from "../../../../shared/src/util/general";
import DisconnectButton from "../DisconnectButton.vue";
import InputField from "../forms/InputField.vue";
import HasInputFields from "../../mixins/HasInputFields";

const {setInterval} = window;

export default defineComponent({
    name: "CommandCentre",
    mixins: [HasInputFields],
    components: {InputField, DisconnectButton, Buttons},
    props: {},
    data() {
        return {
            ParamType,

            commands: {} as CommandTemplates,
            numberOfConnectedClients: 0,

            inputParams: [] as Array<number | string | boolean | undefined>,
            selectedCommand: "",

            planCommand: false,
            expectedCycle: -1,
            cycleTime: 2,

            text: [] as Array<string>,
            error: true,

            interval: -1,

            buttonConfig: [
                {
                    text: "Send",
                    callback: (): void => {
                        if (!this.validateInputs()) {
                            return;
                        }

                        this.sendCommand();
                        this.clearInputs();
                    },
                },
                {
                    text: "Return as a tyrant",
                    callback: (): void => {
                        this.exitTyrantView();
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

        const data = this.$store.state.data;
        if (data) {
            this.numberOfConnectedClients = (data as { numberOfConnections: number }).numberOfConnections;
        }

        socket.on("room-connection-update", this.roomConnectionUpdate);
        socket.on("event", this.eventRegistered);

        this.interval = setInterval(() => {
            this.SocketHandler.getExecutionCyclePrediction().then((c) => this.expectedCycle = c);
        }, 1000);

        changeTitle(`COMMAND CENTRE! (Room: ${room.id})`);
        window.manager.resize(800, 600);
    },
    unmounted() {
        const socket = ensure(SocketHandler.instance.socket);
        socket.off("room-connection-update", this.roomConnectionUpdate);
        socket.off("event", this.eventRegistered);

        clearInterval(this.interval);
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
    },
    methods: {
        ensure,
        copyRoomId() {
            window.clipboard.write(ensure(SocketHandler.instance.room).id);
        },
        getCommandRules(index: number): Array<string> {
            const rules: Array<string> = ['max:1000'];

            const def = this.getCommandParameter(index)?.default;

            /* Truthy won't work as '0' or '' could be valid defaults */
            if (def === null || def === undefined) {
                rules.push('required')
            }

            return rules;
        },
        getCommandParameter(index: number): CommandParamConfig {
            return this.commandParams[index];
        },
        getCommandParameterDefault(index: number): string {
            return (this.getCommandParameter(index)?.default ?? '').toString();
        },
        getCommandParameterPlaceholderText(index: number): string {
            const param = this.getCommandParameter(index);
            const def = this.getCommandParameterDefault(index);

            const defString = def ? ` (default: ${def})` : '*';

            return param.name + defString;
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
        exitTyrantView() {
            SocketHandler.instance.loseTyrant(ensure(SocketHandler.instance.room).id)
                .then(() => {
                    this.$store.commit("changeWindow", "Room");
                })
                .catch(() => {
                    this.$store.commit("changeWindow", "MainRoom");
                });
        },
        async disconnect() {
            await SocketHandler.instance.leaveRoom();
            await GameHandler.instance.resetState(ensure(SocketHandler.instance.room).map);
            this.$store.commit("changeWindow", "MainRoom");

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
            this.inputParams = [];

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
        margin-top: 15px;

        #command {
            width: 100%;

            #clear-command-button {
                margin-left: 4px;
            }

            #plan-command {
                width: 30vw;

                #plan-cycle-warning {
                    color: red;
                }

                input {
                    margin-top: 3px;
                }

                .expected-execution-time {
                    margin: 0;
                }
            }
        }

        #params {
            .param-entry {
                margin: 4px 0;

                td:first-child {
                    padding-right: 10px;
                }

                td {
                    width: 250px;
                }
            }
        }

        #text {
            #error {
                color: red;
            }
        }

        .header {
            margin-bottom: 3px;
        }
    }

    #info {
        border-bottom: 1px solid #b6b6b6;
        padding-bottom: 10px;
    }
}

input, button {
    padding: 5px;
}

input[type=checkbox] {
    margin-left: 0;
}
</style>
