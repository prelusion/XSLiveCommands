<template>
    <div id="loading" v-html="text"></div>
</template>

<script lang="ts">
import {GameHandler} from "@/classes/game-handler";
import {SocketHandler} from "@/classes/socket-handler";
import {io} from "socket.io-client";
import {defineComponent} from "vue";
import {ConfigFileFormatNewest} from "../../interfaces/config";
import {CONFIG_VERSION} from "../../versions";

const {setTimeout} = window;

export default defineComponent({
    name: "Loading",
    components: {},
    props: {},
    data() {
        return {
            timeout: -1,
            connectedToServer: false,
            retrievedSteamId: false,
            loadedSettings: false,
            error: [] as Array<string>,
        };
    },
    async mounted() {
        // Don't read this async as the config file could contain info that is used for the other loading tasks
        const config = await window.config.readConfig(parseFloat(CONFIG_VERSION)) as ConfigFileFormatNewest;
        if (config.version) {
            this.$store.state.config = config;
            this.loadedSettings = true;
        }

        window.regedit.getSteamId().then(steamId => {
            if (steamId === null)
                return;

            GameHandler.instance.steamId = steamId;
            this.retrievedSteamId = true;
        });

        const serverUrl = await window.manager.getEnvVar('SERVER_URL') as string;
        const socket = io(config["custom-server-hostport"] || serverUrl || 'https://xssync.aoe2.se/');
        socket.on("connect", () => {
            this.$store.state.connectionOk = true;

            const sh = SocketHandler.instance;
            sh.socket = socket;
            sh.verifyRoomExistsOnReconnect(this.$store);

            this.connectedToServer = true;
        });

        socket.on("disconnect", () => {
            this.$store.state.connectionOk = false;
        });
    },
    computed: {
        text() {
            let lines = [
                (!this.loadedSettings ? "Loading settings..." : "Settings loaded successfully!"),
                (!this.retrievedSteamId ? "Loading Steam ID..." : "Steam ID loaded successfully!"),
                (!this.connectedToServer ? "Connecting to server..." : "Connected to server successfully!"),
            ];

            if (this.error.length > 0)
                lines = lines.concat([""], this.error);

            return lines.join("<br>");
        },
    },
    methods: {
        checkIfLoadingComplete() {
            if (this.connectedToServer && this.retrievedSteamId && this.loadedSettings) {
                setTimeout(() => this.$store.commit("changeWindow", "MainWindow"), 200);
            }
        },
    },
    watch: {
        connectedToServer() {
            this.checkIfLoadingComplete();
        },
        retrievedSteamId() {
            this.checkIfLoadingComplete();
        },
    },
});

</script>

<style scoped lang="scss">
#loading {
    width: 100%;
    text-align: center;
}
</style>
