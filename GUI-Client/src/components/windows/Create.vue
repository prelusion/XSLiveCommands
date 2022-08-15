<template>
    <div v-if="creationInProgress" id="loading">
        Creating room...
    </div>
    <div v-else>
        <div>
            <div id="password">
                <div id="show-password">
                    <input v-model="password" placeholder="Password for Tyrants" v-bind:type="passwordType">

                    <label>
                        <input v-model="showPassword" type="checkbox"> Show password
                    </label>
                </div>

                <span class="small-text">
                    This password is <b>not</b> for players but is required for <b>tyrants</b> to send commands in a lobby.
                    <br/>
                    (it may be blank, but that is not recommended)
                </span>
            </div>

            <div id="file-selection">
                <div class="flex-row-center" v-if="this.loadedAvailableScenarios">
                    <input v-model="enteredFilename" list="scenarios" placeholder="Select Scenario">
                    <datalist id="scenarios">
                        <option v-for="(name) in Object.keys(this.scenarios)" v-bind:key="name">{{ name }}</option>
                    </datalist>
                    <button @click="enteredFilename = ''"
                            id="clear-scenario-button"
                            title="Clear the scenario selection text box">Clear
                    </button>
                    <span id="file-selection-text">{{ this.scenarioName || 'No scenario selected' }}</span>
                </div>
                <div>
                    <span id="error" v-html="errors.join('<br>')"></span>
                </div>
            </div>
        </div>
        <Buttons :buttonConfig="buttonConfig"></Buttons>
    </div>
</template>

<script lang="ts">
import {GameHandler} from "@/classes/game-handler";
import {SocketHandler} from "@/classes/socket-handler";
import Buttons from "@/components/Buttons.vue";
import {CommandTemplates} from "@/interfaces/command";
import {changeTitle, ensure} from "@/util/general";
import {defineComponent} from "vue";

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
            scenarioName: "",
            commands: {} as CommandTemplates | undefined,
            scenarios: {} as Record<string, string>,

            showPassword: false,
            creationInProgress: false,
            selectInProgress: false,
            loadedAvailableScenarios: false,

            buttonConfig: [
                {
                    window: "Main",
                    text: "Cancel",
                },
                {
                    text: "Create",
                    callback: () => {
                        this.createRoom();
                    },
                    disabled: () => !this.filepath,
                },
            ] as Array<ButtonConfig>,
        };
    },
    async mounted() {
        changeTitle("Create Room...");
        const config = ensure(this.$store.state.config);

        this.filepath = config["last-scenario-path"] ?? "";

        if (this.filepath) {
            const scenarioExists = await window.fs.exists(this.filepath);
            const commandFleExists = await window.fs.exists(this.commandFilepath);

            if (!scenarioExists || !commandFleExists)
                this.filepath = "";
            else {
                this.scenarioName = this.filepath
                    .replaceAll("\\", "/")
                    .split("/")
                    .slice(-1)[0]
                    .replace(/.aoe2scenario$/, "");
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
                ...await window.fs.getCompatibleScenarios(GameHandler.instance.steamId, mod.Path), ...this.scenarios,
            };
        }

        this.loadedAvailableScenarios = true;
    },
    computed: {
        passwordType(): string {
            return this.showPassword ? "text" : "password";
        },
        commandFilepath(): string {
            return this.filepath.replace(/.aoe2scenario$/, ".json");
        },
    },
    methods: {
        async selectFile(filepath: string) {
            const result = await window.fs.readCommands(this.commandFilepath);

            if (result.commands) {
                this.filepath = filepath;
                this.commands = result.commands;
                this.errors = [];
            } else {
                if (result.reason === 'no-json') {
                    this.errors = [
                        "Commands File Not Found",
                        "A JSON file with the same name as the scenario containing information about the commands must be present.",
                    ];
                } else if (result.reason === 'invalid-json') {
                    this.errors = [
                        "Invalid Commands File",
                        "The JSON Commands file corresponding with the scenario is invalid.",
                    ];
                }
            }
        },
        createRoom() {
            this.creationInProgress = true;

            this.$store.commit('patchConfig', {key: 'last-scenario-path', value: this.filepath});

            SocketHandler.instance.createRoom(this.scenarioName, ensure(this.commands), this.password)
                .then(() => {
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
            this.filepath = this.scenarios[this.enteredFilename] ?? "";
            if (this.filepath) {
                this.scenarioName = this.enteredFilename;
                this.selectFile(this.filepath);
            } else
                this.scenarioName = "";
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
