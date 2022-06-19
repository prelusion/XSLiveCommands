<template>
    <div id="loading" v-html="text"></div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {io} from "socket.io-client";
import {GameHandler} from "@/classes/game-handler";
import {SocketHandler} from "@/classes/socket-handler";

export default defineComponent({
    name: "LoadingWindow",
    components: {},
    props: {},
    data() {
        return {
            timeout: -1,
            connectedToServer: false,
            retrievedSteamId: false,
            error: [] as Array<string>,
        }
    },
    mounted() {
        window.regedit.getSteamId().then(steamId => {
            GameHandler.instance.steamId = steamId;
            this.retrievedSteamId = true;
        });

        const socket = io("ws://localhost:80");
        socket.on('connect', () => {
            SocketHandler.instance.socket = socket;
            this.connectedToServer = true;
        })
    },
    computed: {
        text() {
            let lines = [
                (!this.retrievedSteamId ? 'Loading Steam ID...' : 'Steam ID loaded successfully.'),
                (!this.connectedToServer ? 'Connecting to server...' : 'Connected to server successfully.')
            ]

            if (this.error.length > 0)
                lines = lines.concat([''], this.error)

            return lines.join('<br>');
        }
    },
    methods: {
        checkIfLoadingComplete() {
            if (this.connectedToServer && this.retrievedSteamId) {
                setTimeout(() => this.$store.commit('changeWindow', 'MainWindow'), 200);
            }
        }
    },
    watch: {
        connectedToServer() {
            this.checkIfLoadingComplete()
        },
        retrievedSteamId() {
            this.checkIfLoadingComplete()
        }
    }
})

</script>

<style scoped lang="scss">
#loading {
    width: 100%;
    text-align: center;
}
</style>
