<template>
    <div v-if="creationInProgress" id="loading">
        Creating room...
    </div>
    <div v-else>
        <div>
            <button @click="openFilePrompt" v-bind:disabled="selectInProgress">Select scenario file</button>
            <div id="file">
                Selected file:
                <span>{{ filename ? filename : 'No file selected' }}</span>
            </div>
            <div id="error" v-html="text.join('<br>')"></div>
        </div>
        <Buttons :buttonConfig="buttonConfig"></Buttons>
    </div>
</template>

<script lang="ts">
import {GameHandler} from "@/classes/game-handler";
import {SocketHandler} from "@/classes/socket-handler";
import Buttons from "@/components/Buttons.vue";
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
            creationInProgress: false,
            selectInProgress: false,
            buttonConfig: [
                {
                    window: "Main",
                    text: "Cancel",
                    callback: () => this.resetWindow(),
                },
                {
                    text: "Create room",
                    callback: () => {
                        this.createRoom();
                    },
                    disabled: () => !this.filepath,
                },
            ] as Array<ButtonConfig>,
        };
    },
    mounted() {
        this.resetWindow();
    },
    computed: {
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
    },
    methods: {
        resetWindow() {
            this.filepath = "";
            this.creationInProgress = false;
            this.selectInProgress = false;
        },
        openFilePrompt() {
            this.selectInProgress = true;

            window.dialog
                .select(GameHandler.instance.steamId)
                .then((value: SteamIdResponse) => {
                    this.selectInProgress = false;

                    if (value.filepath) {
                        this.filepath = value.filepath;
                    } else if (value.reason !== "cancelled") {
                        this.text = ["Unknown Error", "An unknown error has occurred."];
                    }
                });
        },
        createRoom() {
            this.creationInProgress = true;

            SocketHandler.instance.createRoom(this.plainFilename)
                .then(() => {
                    this.resetWindow();
                    this.$store.commit("changeWindow", "Created");
                })
        },
    },
    watch: {},
});

</script>

<style scoped lang="scss">
button {
    padding: 10px;
}

#file {
    padding: 10px 0;
}

#error {
    color: red;
    padding: 10px;
}

#loading {
    width: 100%;
    text-align: center;
}
</style>
