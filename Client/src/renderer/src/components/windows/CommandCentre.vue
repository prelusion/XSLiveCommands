<template>
    <disconnect-button @disconnect="disconnect"/>
    <div id="view">
        <div id="info">
            <table>
            <tr>
                <td>Room Code:</td>
                <td>{{ roomId }}</td>
                <td>
                    <button @click="copyRoomId()">Copy</button>
                </td>
            </tr>
            <tr>
                <td>Map:</td>
                <td>{{ mapName }}</td>
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
                            <option v-bind:key="name" v-for="(name) in Object.keys(room.mapCtx.commands)"
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
import Buttons from "../../components/Buttons.vue";
import {changeTitle} from "../../util/general";
import {defineComponent} from "vue";
import {ButtonConfig} from "../../types/buttons";
import {ensure} from "../../../../shared/src/util/general";
import DisconnectButton from "../DisconnectButton.vue";
import InputField from "../forms/InputField.vue";
import HasInputFields from "../../mixins/HasInputFields";
import {UserServerAction} from "../../classes/user-server-action";
import {ParamStruct} from "../../../../shared/src/types/commands/structs";
import {Param, ParamType} from "../../../../shared/src/types/commands/scheduled";
import {Room} from "../../../../shared/src/types/room";

const {setInterval} = window;

export default defineComponent({
    name: "CommandCentre",
    mixins: [HasInputFields],
    components: {InputField, DisconnectButton, Buttons},
    props: {},
    data() {
        return {
            inputParams: [] as Array<number | string | boolean | undefined>,
            selectedCommand: "",

            planCommand: false,
            expectedTick: -1,
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
                    text: "Leave Tyranny",
                    callback: (): void => {
                        this.exitTyrantView();
                    },
                },
            ] as Array<ButtonConfig>,

            get room(): Room {
                return ensure(UserServerAction.room);
            },
        };
    },
    mounted() {
        this.interval = setInterval(() => {
            UserServerAction.getTickPrediciton().then(tick => {
                this.expectedTick = tick;
            })
        }, 1000);

        changeTitle(`COMMAND CENTRE! (Room: ${this.room.id})`);
        window.manager.resize(800, 600);
    },
    unmounted() {
        clearInterval(this.interval);
    },
    computed: {
        roomId() {
            return this.room.id
        },
        mapName() {
            return this.room.mapCtx.name;
        },
        commandId(): string | undefined {
            return this.room.commands.get(this.selectedCommand)?.function;
        },
        commandParams(): Array<ParamStruct> {
            return this.room.commands.get(this.selectedCommand)?.params ?? [];
        },
    },
    methods: {
        copyRoomId() {
            window.clipboard.write(this.room.id);
        },
        getCommandRules(index: number): Array<string> {
            const rules: Array<string> = ['max:1000'];

            const def = this.getCommandParameter(index).default;

            /* Truthy won't work as '0' or '' could be valid defaults */
            if (def === null || def === undefined) {
                rules.push('required')
            }

            return rules;
        },
        getCommandParameter(index: number): ParamStruct {
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
            return ParamType[this.getCommandParameter(index).type.toUpperCase()];
        },
        commandInputType(index: number): string {
            const type = this.getCommandParameterType(index);
            switch (type) {
                case ParamType.INT:
                case ParamType.FLOAT:  return 'number';
                case ParamType.BOOL:   return 'checkbox';
                case ParamType.STRING: return 'text';
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
        exitTyrantView() {
            UserServerAction.leaveTyrant()
                .then(() => {
                    this.$store.commit("changeWindow", "Room");
                })
                .catch(() => {
                    this.$store.commit("changeWindow", "MainRoom");
                });
        },
        async disconnect() {
            await UserServerAction.leaveRoom();

            this.$store.commit("changeWindow", "MainRoom");
        },
        sendCommand(): void {
            if (this.commandId === undefined) {
                return this.setError("Please choose a valid command");
            }
            const params: Array<Param> = [];

            for (let i = 0; i < this.commandParams.length; ++i) {
                const param = this.commandParams[i];
                let value = this.inputParams[i] ?? param.default;
                const type = param.type;

                // A checkbox loaded initially (not clicked) is undefined even though it should be false.
                if (type === 'bool' && value === undefined) {
                    value = false;
                }
                if (value === undefined) {
                    return this.setError("Please enter values for all required arguments before sending the command!");
                }
                params.push(<Param>{
                    type: this.getCommandParameterType(i),
                    name: param.name,
                    value,
                });
            }

            this.setText("Command Sent!");
            this.inputParams = [];

            UserServerAction.issueCommand(this.commandId, params)
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
