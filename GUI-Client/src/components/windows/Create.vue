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
                <div class="flex-row-center">
                    <button @click="openFilePrompt" v-bind:disabled="selectInProgress">Browse...</button>
                    <span v-if="lastScenarioPath" class="flex-row-center">
                        |
                        <button
                            id="last-scenario-path-button"
                            @click="selectFile(lastScenarioPath)"
                            v-bind:disabled="selectInProgress"
                            v-bind:title="lastScenarioPath"
                        >
                            Select Previous
                            <span class="small-text">
                                {{ lastScenarioPath.split("\\").at(-1) }}
                            </span>
                        </button>
                    </span>
                    <span id="file-selection-text">{{ filename || 'No scenario selected' }}</span>
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
import {SteamIdResponse} from "electron/libs/dialog";
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
            commands: {} as CommandTemplates | undefined,
            lastScenarioPath: "",

            showPassword: false,
            creationInProgress: false,
            selectInProgress: false,

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
    mounted() {
        changeTitle('Create Room...');
        const config = ensure(this.$store.state.config);

        if (config['last-scenario-path']) {
            this.lastScenarioPath = config['last-scenario-path'];
        }
    },
    computed: {
        passwordType(): string {
            return this.showPassword ? "text" : "password";
        },

        /**
         * Get the file name from the path
         * From: `C:/.../.../<file>.aoe2scenario`. To: `<file>.aoe2scenario`
         */
        filename(): string {
            return this.filepath.split("\\").splice(-1)[0];
        },

        /**
         * Get the plain file name without extension from the path
         * From: `C:/.../.../<file>.aoe2scenario`. To: `<file>`
         */
        plainFilename(): string {
            return this.filename.split(".")[0];
        },
    },
    methods: {
        getCommandFilepath(filepath: string) {
            const folders = filepath.split("\\");
            const file = folders.splice(-1)[0];
            const folderPath = folders.join('\\');
            return folderPath + '\\' + file.split(".")[0] + ".json";
        },
        openFilePrompt() {
            this.selectInProgress = true;

            window.dialog
                .select(GameHandler.instance.steamId)
                .then(async (value: SteamIdResponse) => {
                    this.selectInProgress = false;
                    if (value.filepath) {
                        await this.selectFile(value.filepath);
                    } else if (value.reason !== "cancelled") {
                        this.errors = ["Unknown Error", "An unknown error has occurred."];
                    }
                });
        },
        async selectFile(filepath: string) {
            const result = await window.fs.readCommands(this.getCommandFilepath(filepath));

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

            SocketHandler.instance.createRoom(this.plainFilename, ensure(this.commands), this.password)
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
    watch: {},
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

</style>
