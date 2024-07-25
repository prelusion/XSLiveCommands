<script setup lang="ts">
import {changeTitle} from "../../util/general";
import {computed, onMounted, onUnmounted, ref, toRaw, watch} from "vue";
import {ButtonConfig} from "../../types/buttons";
import {ensure, assert} from "../../../shared/src/util/general";
import {SocketId} from "../../types/player";
import {UserServerAction} from "@renderer/util/user-server-action";
import {Param, ParamType} from "../../../shared/src/types/commands/scheduled";
import {useRouter} from "vue-router";
import {Room} from "../../../shared/src/types/room";
import {ParamStruct} from "../../../shared/src/types/commands/structs";
import {useMainStore} from "@store/main";
import {clearInputs, validateInputs} from "@renderer/util/form/validation";
import {Route} from "@renderer/router/routes";
import InputField from "@renderer/components/InputField.vue";
import Buttons from "@renderer/components/Buttons.vue";
import RoomHeader from "@renderer/components/RoomHeader.vue";

const {setTimeout} = window;

const store = useMainStore();
const router = useRouter();

const commandSelectionInput = ref<typeof InputField | null>(null);
const commandParamValueInputs = ref<(typeof InputField | null)[]>([]);
const commandParamValues = ref<(number | string | boolean | undefined)[]>([]);

/* Create a temporary room */
const room = ref<Room>(Room.new());

const selectedCommand = ref("");

const isClickable = ref(true);
const text = ref<string[]>([]);
const error = ref(true);

onMounted(() => {
    room.value = ensure(UserServerAction.room);

    UserServerAction.onRoomUpdate(updateRoom);

    changeTitle(`COMMAND CENTRE!`);
});

onUnmounted(async () => {
    UserServerAction.offRoomUpdate(updateRoom);
});

const sendCommand = async () => {
    if (!isClickable.value)
        return;

    if (!commandId.value) {
        setError("Please choose a valid command");
        return;
    }

    const valid = validateInputs(commandParamValueInputs.value);
    if (!valid)
        return;

    const params = getParamsFromInputs();
    if (params === null) {
        return;
    }

    setCommandCooldown();

    await UserServerAction.issueCommand(commandId.value, params);

    setText("Command Sent!");

    clearInputs([commandSelectionInput.value]);
    commandParamValues.value = [];
}

const getParamsFromInputs = (): Param[] | null => {
    const params: Param[] = [];

    for (let i = 0; i < commandParams.value.length; ++i) {
        const inputValue = commandParamValues.value[i] !== ''
            ? commandParamValues.value[i]
            : null;

        const param = commandParams.value[i];

        let value = inputValue ?? param.default;

        /* A checkbox loaded initially (not clicked) is undefined even though it should be false. */
        if (param.type === 'bool' && value === undefined) {
            value = false;
        }

        if (value === undefined) {
            setError("Please enter values for all required arguments before sending the command!");
            return null;
        }

        params.push(<Param>{
            type: getCommandParameterType(i) as ParamType,
            name: param.name,
            value,
        });
    }

    return params;
}

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

const updateRoom = (newRoom: Room | null) => {
    if (!newRoom?.isTyrant(UserServerAction.skt?.id as SocketId)) {
        router.replace({name: Route.ROOM});
        return;
    }
    if (newRoom) {
        room.value = newRoom;
        return;
    }

    router.replace({
        name: Route.MAIN,
        query: {
            message: 'The server does not recognize the room anymore, please join or create a new one.'
        }
    });
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

    /* Add required as a rule when no default was given */
    /* Truthy won't work as '0' or '' could be valid defaults */
    if (def === undefined) {
        rules.push('required');
    }

    return rules;
};

const setCommandCooldown = () => {
    isClickable.value = false;

    setTimeout(() => {
        isClickable.value = true;
    }, 300);
};

const exitTyrantView = async () => {
    try {
        await UserServerAction.leaveTyrant();
        await router.replace({name: Route.ROOM});
    } catch {
        await router.replace({name: Route.MAIN});
    }
};

watch(commandId, () => {
    text.value = [];
    commandParamValues.value = [];
});

const buttonConfig = ref<ButtonConfig[]>([
    {
        text: "Send",
        callback: sendCommand,
        disabled: (): boolean => !isClickable.value,
    },
    {
        text: "Leave Tyranny",
        callback: exitTyrantView,
        disabled: () => false,
    },
]);

const submitSearch = (event: InputEvent) => {
    const target = (event.target as HTMLInputElement);
    const value = target.value;

    if (room.value.commands.has(value)) {
        selectedCommand.value = value;
        target.value = '';
        return;
    }

    const options = [...room.value.commands.values()]
        .filter((option) => option.name.toLowerCase().includes(value.toLowerCase()))

    if (options.length > 0) {
        selectedCommand.value = options[0].name;
        target.value = '';
        return;
    }

    target.value = '';
    selectedCommand.value = '';
}

window.addEventListener('keyup', (event: KeyboardEvent) => {
    // console.log(event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.key);
    if (!commandSelectionInput.value)
        return;

    if (event.ctrlKey && event.key.toLowerCase() === 'q') {
        commandSelectionInput.value.focus();
        return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === 'enter') {
        sendCommand();
        return;
    }
})
</script>

<template>
    <div id="view">
        <div>
            <RoomHeader :room="room as Room"></RoomHeader>
        </div>
        <div id="command-centre">
            <div id="command">
                <div id="command-selection">
                    <div id="command-top-order">
                        <div style="display: flex; flex-direction: row; align-items: center;">
                            <div style="width: 300px; height: 30px; display: block">
                                <InputField
                                    name="command-selection"
                                    v-on:change="submitSearch"
                                    ref="commandSelectionInput"
                                    list="commands"
                                    placeholder="Select Command"
                                />
                            </div>
                        </div>

                        <datalist id="commands">
                            <option v-bind:key="name" v-for="(name) in Object.keys(room.mapCtx.commands)"
                                    v-bind:value="name"></option>
                        </datalist>
                    </div>

                    <div id="selected-command">
                        {{ selectedCommand }}
                    </div>

                    <div id="params">
                        <div class="header" v-if="commandParams?.length > 0">
                            Arguments:
                        </div>
                        <table>
                            <tr class="param-entry" v-for="(_, index) in commandParams?.length ?? 0" v-bind:key="index">
                                <td>
                                    <InputField
                                        :ref="(el: unknown) => commandParamValueInputs[index] = toRaw(el) as typeof InputField"
                                        v-model="commandParamValues[index]"
                                        :name="getCommandParameter(index).name"
                                        :type="commandInputType(index)"
                                        :placeholder="getCommandParameterPlaceholderText(index)"
                                        :rules="getCommandRules(index)"
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
    <Buttons :buttonConfig="buttonConfig"/>
</template>

<style scoped lang="scss">
#view {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    #command-centre {
        padding: 20px;

        #command {
            width: 100%;

            #selected-command {
                width: 100%;
                margin-top: 10px;
                margin-bottom: 5px;
                font-weight: bold;
            }

            #plan-command {
                width: 30vw;

                #plan-cycle-warning {
                    color: red;
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

    table {
        tr {
            td:nth-child(2) {
                padding-left: 10px;
            }
        }
    }
}

command-param-value-inputs,
button {
    padding: 5px;
}

input[type="checkbox"] {
    margin-left: 0;
}
</style>
