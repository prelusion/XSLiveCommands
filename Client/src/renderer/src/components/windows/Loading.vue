<template>
    <div id="loading" v-html="text"></div>
</template>

<script lang="ts">
import {GameHandler} from "../../classes/game-handler";
import {SocketHandler} from "../../classes/socket-handler";
import {io} from "socket.io-client";
import {defineComponent} from "vue";
import {ConfigFileFormatNewest} from "../../../../shared/src/types/config";
import {CONFIG_VERSION} from "../../versions";
import {changeTitle} from "../../util/general";

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
        changeTitle("Loading...");

        // Don't read this async as the config file could contain info that is used for the other loading tasks
        const config = await window.config.readConfig(parseFloat(CONFIG_VERSION)) as ConfigFileFormatNewest;
        if (config.version) {
            this.$store.state.config = config;
            this.loadedSettings = true;
        }

        window.registry.getSteamId().then(steamId => {
            if (steamId === null)
                return;

            GameHandler.instance.steamId = steamId;
            this.retrievedSteamId = true;
        });

        const customUrl = config["custom-server-hostport"];
        const serverUrl = await window.manager.getEnvVar('SERVER_URL') as string;
        const fallback = 'https://xssync.aoe2.se/';

        const socket = io(customUrl || serverUrl || fallback);
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
                setTimeout(() => this.$store.commit("changeWindow", "MainRoom"), 200);
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
