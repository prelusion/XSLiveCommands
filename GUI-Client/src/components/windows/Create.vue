<template>
    <div v-if="creationInProgress" id="loading">
        Creating room...
    </div>
    <div v-else>
        <div>
            <div>
                <div id="file">
                    Selected file:
                    <span>{{ filename || 'No file selected' }}</span>
                </div>
                <button @click="openFilePrompt" v-bind:disabled="selectInProgress">Select scenario file</button>
                <span id="error" v-html="text.join('<br>')"></span>
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
import {CommandStruct} from "@/interfaces/command";
import {ensure} from "@/util/general";
import {SteamIdResponse} from "electron/libs/dialog";
import {defineComponent} from "vue";

export default defineComponent({
    name: "CreateRoom",
    components: {Buttons},
    props: {},
    data() {
        return {
            text: [] as Array<string>,
            filepath: "",
            commands: [] as Array<CommandStruct> | undefined,
            password: "",
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
         * From: `C:/.../.../file.aoe2scenario`. To: `file.aoe2scenario`
         */
        filename(): string {
            return this.filepath.split("\\").splice(-1)[0];
        },

        /**
         * Get the plain file name without extension from the path
         * From: `C:/.../.../file.aoe2scenario`. To: `file`
         */
        plainFilename(): string {
            return this.filename.split(".")[0];
        },

        /**
         * Get the directory of the file
         * From: `C:/.../.../file.aoe2scenario`. To: `file`
         */
        commandsPath(): string {
            return this.filepath.split(".")[0] + ".json";
        },
    },
    methods: {
        openFilePrompt() {
            this.selectInProgress = true;

            window.dialog
                .select(GameHandler.instance.steamId)
                .then(async (value: SteamIdResponse) => {
                    this.selectInProgress = false;

                    if (value.filepath) {
                        this.filepath = value.filepath;
                        this.commands = await window.fs.readCommands(this.commandsPath);
                        this.text = [];
                        if (!this.commands) {
                            this.filepath = "";
                            this.commands = [];
                            this.text = [
                                "Commands File Not Found",
                                "A JSON file with the same name as the scenario containing information about the commands must be present",
                            ];
                        }
                    } else if (value.reason !== "cancelled") {
                        this.text = ["Unknown Error", "An unknown error has occurred."];
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
button {
    padding: 5px;
}

input {
    padding: 4px;
}

#file {
    padding: 0;
}

#error {
    color: red;
    padding: 10px;
}

#password {
    margin-top: 5px;
}

#loading {
    width: 100%;
    text-align: center;
}

.small-text {
    font-size: 13px;
    color: gray;
}
</style>
