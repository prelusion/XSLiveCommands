<script setup lang="ts">
import {changeTitle} from "../../util/general";
import {onMounted, Ref, ref, watch} from "vue";
import {ButtonConfig} from "../../types/buttons";
import {MapCommands, MapName, MapPath} from "../../../shared/src/types/commands/structs";
import {assert, ensure} from "../../../shared/src/util/general";
import {UserServerAction} from "@renderer/util/user-server-action";
import {useMainStore} from "@store/main";
import {useRouter} from "vue-router";
import {Route} from "@renderer/router/routes";
import {validateInputs} from "@renderer/util/form/validation";
import InputField from "@renderer/components/InputField.vue";
import {Mod} from "../../../shared/src/types/mods";
import Buttons from "@renderer/components/Buttons.vue";

/* Vue */
const store = useMainStore();
const router = useRouter();

/* Status flags */
const creationInProgress = ref(false);
const loadedAvailableMaps = ref(false);

/* Input field variables */
const launchCode = ref('');

const maps = ref<Record<MapName, MapPath>>({});

const selectedMap = ref({
    filepath: '',
    mapName: '',
    commands: {} as MapCommands,
});
const errors = ref([] as string[]);

/* Input fields */
const launchCodeInputField = ref<typeof InputField | null>(null);
const inputs: Ref<typeof InputField | null>[] = [launchCodeInputField];

/* Datalist */
const enteredFilename = ref('');

/* ######### Watchers ######### */
watch(enteredFilename, async () => {
    errors.value = [];
    const filepath = maps.value[enteredFilename.value] ?? '';

    if (filepath) {
        selectedMap.value.mapName = enteredFilename.value;
        await selectMap(filepath);
    } else {
        selectedMap.value.mapName = '';
    }
});

/* Events */
onMounted(async () => {
    changeTitle("Create Room...");

    const config = ensure(store.config);

    const prevFilepath: string = config["previous-map"]?.['path'] ?? '';
    const prevMapname: string = config["previous-map"]?.['name'] ?? '';

    if (prevFilepath && prevMapname) {
        const mapExists = await window.fs.exists(prevFilepath);
        const commandFileExists = await window.fs.exists(toCommandFilepath(prevFilepath));

        if (mapExists && commandFileExists) {
            selectedMap.value.mapName = prevMapname;

            await selectMap(prevFilepath);
        }
    }

    /* this list is already sorted in order of decreasing priority (increasing priority number) by the game */
    const mods: Array<Mod> = await window.fs.readModsJson(UserServerAction.platform!);
    for (const mod of mods) {
        if (!mod.Enabled) {
            continue;
        }

        /* Previous maps (higher priority) get priority if same name (exactly how the game handles that too) */
        maps.value = {
            ...await window.fs.getCompatibleMaps(UserServerAction.platform!, mod.Path),
            ...maps.value,
        };
    }

    loadedAvailableMaps.value = true;
});

/* ######### Functions ######### */
/**
 * When a map is selected from the dropdown or when reading the previous map config
 */
const selectMap = async (filepath: string): Promise<void> => {
    const result = await window.fs.readCommands(toCommandFilepath(filepath));

    if (result.commands) {
        errors.value = [];

        selectedMap.value.filepath = filepath;
        selectedMap.value.commands = result.commands;
    } else {
        selectedMap.value.mapName = '';
        selectedMap.value.filepath = '';

        if (result.reason === 'no-json') {
            errors.value.push('Commands File Not Found');
        } else if (result.reason === 'invalid-json') {
            errors.value.push('Invalid Commands File');
        }
    }
}

/**
 * Attempt to create a room
 */
const createRoom = () => {
    creationInProgress.value = true;

    const mapName = selectedMap.value.mapName;

    store.PATCH_CONFIG('previous-map', {
        path: selectedMap.value.filepath,
        name: mapName,
    });

    UserServerAction.createRoom(mapName, ensure(selectedMap.value.commands), launchCode.value)
        .then(() => {
            assert(UserServerAction.room);

            store.$state.tyrantRequest.roomId = UserServerAction.room.id;
            store.$state.tyrantRequest.code = launchCode.value;

            router.replace({name: Route.ROOM, query: {asHost: 1}});
        })
        .catch(error => {
            /* Log it for debugging */
            console.log(error.message)

            creationInProgress.value = false;
        });
};

const toCommandFilepath = (filepath: string): string => {
    return filepath.replace(/.(?:aoe2scenario|rms2?)$/, ".commands.json");
};

const buttonConfig: Array<ButtonConfig> = [
    {
        text: "Create",
        callback: (): void => {
            if (!validateInputs(inputs.map(i => i.value))) {
                return;
            }

            createRoom();
        },
        disabled: (): boolean => !selectedMap.value.filepath,
    },
    {
        route: Route.MAIN,
        text: "Cancel",
    }
];


</script>

<template>
    <div id="create">

        <div v-if="creationInProgress" id="loading">
            Creating room...
        </div>
        <div v-else>
            <div>
                <div id="password">
                    <div id="show-password">
                        <InputField
                            v-model="launchCode"
                            ref="launchCodeInputField"
                            class="input-field"
                            name="launch-code"
                            label="Launch Code"
                            placeholder="Launch Code for Tyrants"
                            :type="'custom-password'"
                            :rules="['max:30']"
                        />
                    </div>

                    <span class="small-text">
                    This Launch Code (password) is <b>not</b> for players but is required for <b>tyrants</b> to send commands in a lobby.<br>
                    <i>It may be left empty, but is not recommended</i>
                </span>
                </div>

                <div id="file-selection">
                    <div class="flex-row-center" v-if="loadedAvailableMaps">
                        <input v-model="enteredFilename" list="scenarios" placeholder="Select Map">
                        <datalist id="scenarios">
                            <option v-for="(name) in Object.keys(maps)" v-bind:key="name">{{ name }}</option>
                        </datalist>
                        <button @click="enteredFilename = ''"
                                id="clear-map-button"
                                title="Clear the map selection text box">Clear
                        </button>
                        <span id="file-selection-text">{{ selectedMap.filepath || 'No map selected' }}</span>
                    </div>
                    <span class="small-text">
                    For a map to be detected, a json file with the following format:
                    <i>&lt;mapname&gt;.commands.json</i> containing information about supported commands must be
                    present in the same folder as the map.<br>
                    <i>This list will <b>not</b> refresh automatically</i>.
                </span>
                    <div>
                        <span id="error" v-html="errors.join('<br>')"></span>
                    </div>
                </div>
            </div>
            <Buttons :buttonConfig="buttonConfig"></Buttons>
        </div>
    </div>
</template>

<style scoped lang="scss">
#create {
    padding: 20px;
}
input, .input-field {
    width: 250px;

    &.show-password {
        width: 120px;
    }
}

.small-text {
    margin-top: 2px;
    font-size: 12px;
    color: gray;
    display: inline-block;
    line-height: 12px;
}

.flex-row-center {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;
}

#password {
    input {
        padding: 6px;
    }

    #show-password {
        display: flex;
        flex-direction: row;
    }
}

#file-selection {
    margin-top: 20px;

    button {
        height: 30px;
        display: inline-block;

        span.small-text {
            font-size: 10px;
            display: block;
        }
    }

    input {
        height: 30px;
    }

    #file-selection-text {
        margin-left: 10px;
    }
}

#error {
    color: red;
    margin-top: -3px;
    font-size: 15px;
}

#loading {
    margin-top: 40vh;
    width: 100%;
    text-align: center;
}
</style>
