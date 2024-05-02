<template>
    <div v-if="creationInProgress" id="loading">
        Creating room...
    </div>
    <div v-else>
        <div>
            <div id="password">
                <div id="show-password">
                    <InputField
                        ref="input-1"
                        class="input-field"
                        name="launch-code"
                        label="Launch Code"
                        placeholder="Launch Code for Tyrants"
                        :type="passwordType"
                        :rules="['max:30']"
                        @onValueUpdated="password = $event"
                    />

                    <InputField
                        ref="input-2"
                        class="input-field show-password"
                        name="show-password"
                        label="Show password"
                        type="checkbox"
                        :debounce="0"
                        @onValueUpdated="showPassword = $event"
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
                    <span id="file-selection-text">{{ mapName || 'No map selected' }}</span>
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
</template>

<script lang="ts">
import Buttons from "../../components/Buttons.vue";
import {changeTitle} from "../../util/general";
import {defineComponent} from "vue";
import {ButtonConfig} from "../../types/buttons";
import {ensure} from "../../../../shared/src/util/general";
import InputField from "../forms/InputField.vue";
import HasInputFields from "../../mixins/HasInputFields";
import {UserServerAction} from "../../classes/user-server-action";
import {MapCommands, MapName, MapPath} from "../../../../shared/src/types/commands/structs";
import {Mod} from "../../../../shared/src/types/mods";

export default defineComponent({
    name: "CreateRoom",
    components: {InputField, Buttons},
    mixins: [HasInputFields],
    props: {},
    data() {
        return {
            errors: [] as Array<string>,

            filepath: "",
            password: "",
            enteredFilename: "",
            mapName: "",
            commands: {} as MapCommands | undefined,
            maps: {} as Record<MapName, MapPath>,

            showPassword: false,
            creationInProgress: false,
            selectInProgress: false,
            loadedAvailableMaps: false,

            buttonConfig: [
                {
                    text: "Create",
                    callback: (): void => {
                        if (!this.validateInputs()) {
                            return;
                        }

                        this.createRoom();
                    },
                    disabled: (): boolean => !this.filepath,
                },
                {
                    window: "MainRoom",
                    text: "Cancel",
                }
            ] as Array<ButtonConfig>,
        };
    },
    async mounted() {
        changeTitle("Create Room...");
        const config = ensure(this.$store.state.config);
        const filepath: string = config["last-map-path"] ?? "";
        const mapName: string = config["last-map-name"] ?? "";
        if (filepath) {
            const mapExists = await window.fs.exists(filepath);
            const commandFileExists = await window.fs.exists(this.getCommandFilepath(filepath));

            if (mapExists && commandFileExists) {
                this.mapName = mapName;
                this.selectFile(filepath).then();
            }
        }

        // this list is already sorted in order of decreasing priority (increasing priority number) by the game
        const mods: Array<Mod> = await window.fs.readModsJson(UserServerAction.platform!);
        for (const mod of mods) {
            if (!mod.Enabled) {
              continue;
            }
            // previous maps (higher priority) get priority if same name (exactly how the game handles that too)
            this.maps = {
                ...await window.fs.getCompatibleMaps(UserServerAction.platform!, mod.Path),
                ...this.maps,
            };
        }

        this.loadedAvailableMaps = true;
    },
    computed: {
        passwordType(): string {
            return this.showPassword ? "text" : "password";
        },
        plainMapName(): string {
            return this.mapName.replace(/.(?:aoe2scenario|rms2?)$/, "");
        }
    },
    methods: {
        getCommandFilepath(filepath: string): string {
            return filepath.replace(/.(?:aoe2scenario|rms2?)$/, ".commands.json");
        },
        async selectFile(filepath: string) {
            const result = await window.fs.readCommands(this.getCommandFilepath(filepath));

            if (result.commands) {
                this.filepath = filepath;
                this.commands = result.commands;
                this.errors = [];
            } else {
                this.mapName = '';
                this.filepath = '';

                if (result.reason === 'no-json') {
                    this.errors = [
                        'Commands File Not Found',
                    ];
                } else if (result.reason === 'invalid-json') {
                    this.errors = [
                        'Invalid Commands File',
                    ];
                }
            }
        },
        createRoom() {
            this.creationInProgress = true;

            this.$store.commit('patchConfig', {key: 'last-map-path', value: this.filepath});
            this.$store.commit('patchConfig', {key: 'last-map-name', value: this.mapName});

            UserServerAction.createRoom(this.plainMapName, ensure(this.commands), this.password)
                .then(() => {
                    this.$store.state.tyrantRequest.roomId = ensure(UserServerAction.room).id;
                    this.$store.state.tyrantRequest.code = this.password;

                    this.$store.commit("changeWindow", {
                        window: 'Room',
                        data: {'asHost': true}
                    });
                })
                .catch((_) => {
                    this.creationInProgress = false;
                });
        },
    },
    watch: {
        enteredFilename(): void {
            this.errors = [];
            const filepath = this.maps[this.enteredFilename] ?? "";

            if (filepath) {
                this.mapName = this.enteredFilename;
                this.selectFile(filepath);
            } else {
                this.mapName = "";
            }
        },
    },
});

</script>

<style scoped lang="scss">
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
    width: 100%;
    text-align: center;
}
</style>
