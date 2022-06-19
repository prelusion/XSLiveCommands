<template>
    <div>
        <button @click="openFilePrompt">Select scenario file</button>
        <div id="file">
            Selected file:
            <span>{{ filename ? filename : 'No file selected' }}</span>
        </div>
        <div id="error" v-html="text.join('<br>')"></div>
    </div>
    <Buttons :buttonConfig="buttonConfig"></Buttons>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Buttons from "@/components/Buttons.vue";
import {Room} from "@/interfaces/rooms";

export default defineComponent({
    name: "CreateRoom",
    components: {Buttons},
    props: {},
    data() {
        return {
            text: [] as Array<string>,
            buttonConfig: [
                {
                    window: 'MainWindow',
                    text: 'Cancel',
                    callback: () => this.$store.commit('clearFilePath'),
                },
                {
                    text: 'Create room',
                    callback: () => {
                        this.createRoom();
                    },
                    disabled: () => !this.$store.state.create.filepath,
                },
            ] as Array<ButtonConfig>,
        }
    },
    mounted() {
        // Executed when loaded
    },
    computed: {
        filename(): string {
            return this.$store.state.create.filepath.split('\\').splice(-1)[0];
        }
    },
    methods: {
        openFilePrompt() {
            window.fileControls
                .select(this.$store.state.steamId)
                .then((value: { filepath: string; reason: string }) => {
                    if (value.filepath) {
                        this.$store.commit('setFilePath', value.filepath);
                    } else if (value.reason !== 'cancelled') {
                        this.text = [
                            "Unknown Error", "An unknown error has occurred."
                        ]
                    }
                })
        },
        createRoom() {
            console.log("Creating room... Emitting...")
            this.$store.state.socket?.emit('createRoom', this.filename, async (room: Room) => {
                console.log("Done!")
                // Gets a Room object back, make sure to save the scenario name in the paths....
                this.$store.commit("setRoom", room);

                if (room.scenario !== "") {
                    // todo: implement
                    // await resetState();
                    // interval = startCoreInterval();
                    console.log("The number of connections in your room are " + room.connections.length)
                    // paths.scenarioFile = room.scenario;
                }
            });
        }
    },
    watch: {}
})

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
</style>
