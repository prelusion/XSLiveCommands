<template>
    <div v-if="creationInProgress" id="loading">
        Creating room...
    </div>
    <div v-else>
        <div>
            <div id="password">
                <div id="show-password">
                    <input v-model="password" placeholder="Launch Code for Tyrants" v-bind:type="passwordType">

                    <label>
                        <input v-model="showPassword" type="checkbox"> Show Launch Code
                    </label>
                </div>

                <span class="small-text">
                    This Launch Code (password) is <b>not</b> for players but is required for <b>tyrants</b> to send commands in a lobby.<br>
                    <i>It may be left empty, but is not recommended</i>
                </span>
            </div>

            <div id="file-selection">
                <div class="flex-row-center" v-if="loadedAvailableScenarios">
                    <input v-model="enteredFilename" list="scenarios" placeholder="Select Map">
                    <datalist id="scenarios">
                        <option v-for="(name) in Object.keys(scenarios)" v-bind:key="name">{{ name }}</option>
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
import {GameHandler} from "../../classes/game-handler";
import {SocketHandler} from "../../classes/socket-handler";
import Buttons from "../../components/Buttons.vue";
import {CommandTemplates} from "../../../../shared/src/types/command";
import {changeTitle} from "../../util/general";
import {defineComponent} from "vue";
import {ButtonConfig} from "../../interfaces/buttons";
import {ensure} from "../../../../shared/src/util/general";

export default defineComponent({
    name: "CreateRoom",
    components: {Buttons},
    props: {},
    data() {
        return {
            errors: [] as Array<string>,

            filepath: "",
            password: "",
            enteredFilename: "",
            mapName: "",
            commands: {} as CommandTemplates | undefined,
            scenarios: {} as Record<string, string>,

            showPassword: false,
            creationInProgress: false,
            selectInProgress: false,
            loadedAvailableScenarios: false,

            buttonConfig: [
                {
                    text: "Create",
                    callback: () => {
                        this.createRoom();
                    },
                    disabled: () => !this.filepath,
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
        const filepath = config["last-map-path"] ?? "";
        if (filepath) {
            const scenarioExists = await window.fs.exists(filepath);
            const commandFileExists = await window.fs.exists(this.getCommandFilepath(filepath));

            if (scenarioExists && commandFileExists) {
                this.selectFile(filepath).then(() => this.errors = []);
            }
        }

        // this list is already sorted in order of decreasing priority (increasing priority number) by the game
        const mods = await window.fs.readModsJson(GameHandler.instance.steamId);
        mods.push({
            CheckSum: "",
            Enabled: true,
            LastUpdate: "",
            Path: "..",
            Priority: mods.length + 1, // profile folder's "mod" has the lowest priority
            PublishID: -1,
            Title: "",
            WorkshopID: -1,
        });

        for (const mod of mods) {
            if (!mod.Enabled)
                continue;
            // previous scenarios (higher priority) get priority if same name (exactly how the game handles that too)
            this.scenarios = {
                ...await window.fs.getCompatibleMaps(GameHandler.instance.steamId, mod.Path), ...this.scenarios,
            };
        }

        this.loadedAvailableScenarios = true;
    },
    computed: {
        passwordType(): string {
            return this.showPassword ? "text" : "password";
        },
        plainMapName(): string {
            return this.mapName.replace(/.(?:aoe2scenario|rms|rms2)$/, "");
        }
    },
    methods: {
        getCommandFilepath(filepath: string): string {
            return filepath.replace(/.(?:aoe2scenario|rms|rms2)$/, ".commands.json");
        },
        async selectFile(filepath: string) {
            const result = await window.fs.readCommands(this.getCommandFilepath(filepath));

            if (result.commands) {
                this.filepath = filepath;
                this.mapName = filepath.replaceAll("\\", "/").split("/").slice(-1)[0];
                this.commands = result.commands;
                this.errors = [];
            } else {
                this.mapName = "";
                this.filepath = "";
                if (result.reason === 'no-json') {
                    this.errors = [
                        "Commands File Not Found",
                    ];
                } else if (result.reason === 'invalid-json') {
                    this.errors = [
                        "Invalid Commands File",
                    ];
                }
            }
        },
        createRoom() {
            this.creationInProgress = true;

            this.$store.commit('patchConfig', {key: 'last-map-path', value: this.filepath})

            SocketHandler.instance.createRoom(this.plainMapName, ensure(this.commands), this.password)
                .then(() => {
                    this.$store.state.tyrantRequest.roomId = ensure(SocketHandler.instance.room).id;
                    this.$store.state.tyrantRequest.code = this.password;

                    this.$store.commit("changeWindow", {
                        window: 'Room',
                        data: {'asHost': true}
                    });
                })
                .catch(() => {
                    this.creationInProgress = false;
                });
        },
    },
    watch: {
        enteredFilename(): void {
            this.errors = [];
            const filepath = this.scenarios[this.enteredFilename] ?? "";

            if (filepath) {
                this.selectFile(filepath);
            } else
                this.mapName = "";
        },
    },
});

</script>

<style scoped lang="scss">
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
        padding: 5px;
    }

    #show-password {
        display: flex;
        align-items: center;
    }
}

#file-selection {
    margin-top: 20px;

    button {
        height: 35px;
        display: inline-block;

        span.small-text {
            font-size: 10px;
            display: block;
        }
    }

    #file-selection-text {
        margin-left: 10px;
    }

    #error {
        display: inline-block;
        color: red;
        font-size: 14px;
        line-height: 14px;
    }
}

#loading {
    width: 100%;
    text-align: center;
}

input, button {
    padding: 5px;
}
</style>
