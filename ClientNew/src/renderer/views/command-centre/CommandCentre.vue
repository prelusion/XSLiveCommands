<script setup lang="ts">
import Buttons from "../../components/Buttons.vue";
import { changeTitle } from "../../util/general";
import { ref, onMounted, computed, watch } from "vue";
import { ButtonConfig } from "../../types/buttons";
import { ensure } from "../../../shared/src/util/general";
import DisconnectButton from "../DisconnectButton.vue";
import InputField from "../forms/InputField.vue";
import { SocketId } from "../../types/player";
import { UserServerAction } from "@renderer/util/user-server-action";
import { Param, ParamType } from "../../../shared/src/types/commands/scheduled";
import { useRouter } from "vue-router";
import { Room } from "../../../shared/src/types/room";
import { ParamStruct } from "../../../shared/src/types/commands/structs";
import { useMainStore } from "@store/main";
import { clearInputs, validateInputs } from "@renderer/util/form/validation";
import { Route } from "@renderer/router/routes";

const input = ref<InstanceType<typeof InputField> | null>(null);

const store = useMainStore();
const router = useRouter();

const room = ref<Room>(Room.new());
const selectedCommand = ref("");
const inputParams = ref<(number | string | boolean | undefined)[]>([]);
const expectedTick = ref(-1);
const isClickable = ref(true);
const text = ref<string[]>([]);
const error = ref(true);
const interval = ref<number | undefined>(undefined);

const sendCommand = async (): Promise<void> => {
    if (!commandId.value) {
        setError("Please choose a valid command");
        return;
    }
    const params: Param[] = [];

    for (let i = 0; i < commandParams.value.length; ++i) {
        const inp = inputParams.value[i] === '' ? null : inputParams.value[i];
        const param = commandParams.value[i];

        let value = inp ?? param.default;
        const type = param.type;

        // A checkbox loaded initially (not clicked) is undefined even though it should be false.
        if (type === 'bool' && value === undefined) {
            value = false;
        }
        if (value === undefined) {
            setError("Please enter values for all required arguments before sending the command!");
            return;
        }
        params.push(<Param>{
            type: getCommandParameterType(i) as ParamType,
            name: param.name,
            value,
        });
    }

    setText("Command Sent!");
    inputParams.value = [];

    await UserServerAction.issueCommand(commandId.value, params);
};

const commandId = computed(() => {
    return room.value.commands.get(selectedCommand.value)?.function;
});

const commandParams = computed(() => {
    return room.value.commands.get(selectedCommand.value)?.params ?? [];
});

const commandInputType = (index: number): string => {
    const type = getCommandParameterType(index);
    switch (type) {
        case ParamType.INT:
        case ParamType.FLOAT:
            return 'number';
        case ParamType.BOOL:
            return 'checkbox';
        case ParamType.STRING:
            return 'text';
    }
};

const getCommandParameterType = (index: number): ParamType => {
    return ParamType[commandParams.value[index]?.type.toUpperCase() as keyof typeof ParamType];
};

const getCommandParameter = (index: number): ParamStruct => {
    return commandParams.value[index];
};

const getCommandParameterPlaceholderText = (index: number): string => {
    const param = getCommandParameter(index);
    const def = (param.default ?? '').toString();

    const defString = def ? ` (default: ${def})` : '*';

    return param.name + defString;
};

const setRoom = (newRoom: Room | null) => {
    if (!newRoom?.isTyrant(UserServerAction.skt?.id as SocketId)) {
        router.push({ name: Route.ROOM });
        return;
    }
    if (newRoom) {
        room.value = newRoom;
        return;
    }

    router.push({
        name: Route.MAIN,
        query: {
            message: 'The server does not recognize the room anymore, please join or create a new one.'
        }
    });
};

const getTickPrediction = async () => {
    if (!store.$state.connectionOk) {
        return;
    }
    expectedTick.value = await UserServerAction.getTickPrediction();
};

const setText = (...strings: string[]): void => {
    error.value = false;
    text.value = strings;
};

const setError = (...strings: string[]): void => {
    error.value = true;
    text.value = strings;
};

const getCommandRules = (index: number): Array<string> => {
    const rules: Array<string> = ['max:1000'];

    const def = getCommandParameter(index).default;

    /* Truthy won't work as '0' or '' could be valid defaults */
    if (def === null || def === undefined) {
        rules.push('required');
    }

    return rules;
};

const commandDelay = () => {
    isClickable.value = false;

    setTimeout(() => {
        isClickable.value = true;
    }, 300);
};

const exitTyrantView = async () => {
    try {
        await UserServerAction.leaveTyrant();
        await router.push({ name: Route.ROOM });
    } catch {
        await router.push({ name: Route.MAIN });
    }
};

const disconnect = async () => {
    await UserServerAction.leaveRoom();
    await router.push({ name: Route.MAIN });
};


const copyRoomId = () => {
    window.clipboard.write(room.value.id);
};

onMounted(() => {
    room.value = ensure(UserServerAction.room);
    UserServerAction.onRoomUpdate(setRoom);

    interval.value = window.setInterval(getTickPrediction, 500);

    changeTitle(`COMMAND CENTRE! (Room: ${room.value.id})`);
    window.manager.resize(800, 600);
});

watch(commandId, () => {
    text.value = [];
    inputParams.value = [];
});

const buttonConfig = ref<ButtonConfig[]>([
    {
        text: "Send",
        callback: async (): Promise<void> => {
            ensure(input.value);
            if (!validateInputs([input.value]) || !isClickable.value) {
                return;
            }
            commandDelay();

            await sendCommand();
            clearInputs([input.value]);
        },
        disabled: (): boolean => !isClickable.value,
    },
    {
        text: "Leave Tyranny",
        callback: (): void => {
            exitTyrantView();
        },
        disabled: () => false,
    },
]);
</script>


<template>
    <disconnect-button @disconnect="disconnect"/>
    <div id="view">
        <div id="info">
            <table>
                <tr>
                    <td>Room Code:</td>
                    <td>{{ room.id }}</td>
                    <td>
                        <button @click="copyRoomId()">Copy</button>
                    </td>
                </tr>
                <tr>
                    <td>Map:</td>
                    <td>{{ room.mapCtx.name }}</td>
                </tr>
            </table>
        </div>
        <div id="command-centre">
            <div id="command">
                <div id="command-selection">
                    <div id="command-top-order">
                        <div>
                            <input v-model="selectedCommand" list="commands" placeholder="Select Command" />
                            <button @click="selectedCommand = ''" id="clear-command-button"
                                    title="Clear the command selection text box">
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
                                        @onValueUpdated="inputParams[index] = $event" />
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
    <Buttons :buttonConfig="buttonConfig"/>
</template>

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

input,
button {
    padding: 5px;
}

input[type="checkbox"] {
    margin-left: 0;
}
</style>
