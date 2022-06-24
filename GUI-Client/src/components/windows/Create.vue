<template>
    <div v-if="creationInProgress" id="loading">
        Creating room...
    </div>
    <div v-else>
        <div>
            <div id="file-selection">
                <div>
                    Selected file:
                    <span>{{ filename || 'No file selected' }}</span>
                </div>
                <button @click="openFilePrompt" v-bind:disabled="selectInProgress">Select scenario file</button>
                <span id="error" v-html="errors.join('<br>')"></span>
            </div>

            <div id="password">
                <label>
                    Set a password for Tyrant: <br/>
                    <input v-model="password" v-bind:type="passwordType">

                    <label>
                        <input v-model="showPassword" type="checkbox"> Show password
                    </label>
                    <br/>
                    <span class="small-text">This is <b>NOT</b> for players joining. Password is for the Tyrant joining.</span>
                </label>
            </div>
        </div>
        <Buttons :buttonConfig="buttonConfig"></Buttons>
    </div>
</template>

<script lang="ts">
import {GameHandler} from "@/classes/game-handler";
import {SocketHandler} from "@/classes/socket-handler";
import Buttons from "@/components/Buttons.vue";
import {Commands} from "@/interfaces/command";
import {ensure} from "@/util/general";
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
            commands: {} as Commands | undefined,

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
        // Runs when shown
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
                        const result = await window.fs.readCommands(this.getCommandFilepath(value.filepath));

                        if (result.commands) {
                            this.filepath = value.filepath;
                            this.commands = result.commands;
                            this.errors = [];
                        } else {
                            if (result.reason === 'no-json') {
                                this.errors = [
                                    "Commands File Not Found",
                                    "A JSON file with the same name as the scenario containing information about the commands must be present",
                                ];
                            } else if (result.reason === 'invalid-json') {
                                this.errors = [
                                    "Invalid Commands File",
                                    "The JSON Commands file corresponding with the scenario is invalid.",
                                ];
                            }
                        }
                    } else if (value.reason !== "cancelled") {
                        this.errors = ["Unknown Error", "An unknown error has occurred."];
                    }
                });
        },
        createRoom() {
            this.creationInProgress = true;

            SocketHandler.instance.createRoom(this.plainFilename, ensure(this.commands), this.password)
                .then(() => {
                    this.$store.commit("changeWindow", "Room");
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

#file-selection {
    button {
        padding: 5px;
    }

    #error {
        color: red;
        padding: 10px;
    }
}

#password {
    margin-top: 5px;

    input {
        padding: 4px;
    }

    .small-text {
        font-size: 13px;
        color: gray;
    }
}

#loading {
    width: 100%;
    text-align: center;
}

</style>
