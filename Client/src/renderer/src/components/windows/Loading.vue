<template>
    <div id="loading" v-html="text"></div>
</template>

<script lang="ts">
import {GameHandler} from "../../classes/game-handler";
import {SocketHandler} from "../../classes/socket-handler";
import {io} from "socket.io-client";
import {defineComponent} from "vue";
import {CONFIG_VERSION} from "../../versions";
import {changeTitle, handle} from "../../util/general";
import {ConfigFileFormatNewest} from "../../../../shared/src/types/config";
import {MainErrorTypes} from "../../../../shared/src/util/errors";
import {MainError} from "../../../../shared/src/types/errors";

const {setTimeout} = window;

export default defineComponent({
    name: "Loading",
    components: {},
    props: {},
    data() {
        return {
            timeout: -1,
            connectedToServer: false,
            loadedSettings: false,
            retrievedSteamId: false,
            retrievedSteamName: false,
            error: [] as Array<string>,
        };
    },
    async mounted() {
        changeTitle("Loading...");

        const version = parseFloat(CONFIG_VERSION);

        /* Read config file */
        const result = await handle(window.config.readConfig(version));
        if (result.isError) {
            this.handleConfigError(result.value, version);
            return;
        }

        const config = result.value
        if (config.version) {
            this.$store.state.config = config as ConfigFileFormatNewest;
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

        // Request steam name
        socket.emit("retrieveSteamUsername", GameHandler.instance.steamId, (name: string) => {
            GameHandler.instance.steamName = name;
            this.retrievedSteamName = true;
        });

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

            if (this.loadedSettings) {
                lines.push(this.retrievedSteamId ? "Steam ID loaded successfully!" : "Loading Steam ID...")
                lines.push(this.connectedToServer ? "Connected to server successfully!": "Connecting to server...")
            }

            if (this.error.length > 0)
                lines = lines.concat([""], this.error);

            return lines.join("<br>");
        },
    },
    methods: {
        checkIfLoadingComplete() {
            if (
                this.connectedToServer
                && this.loadedSettings
                && this.retrievedSteamId
                && this.retrievedSteamName
            ) {
                setTimeout(() => this.$store.commit("changeWindow", "MainRoom"), 200);
            }
        },
        handleConfigError(error: MainError, version: number) {
            if (error.type === MainErrorTypes.INVALID_CONFIG) {
                if (confirm("The JSON configuration file cannot be read, do you want to reset it?")) {
                    window.config.resetConfig(version);
                    window.manager.restart();
                } else {
                    this.error.push("Please fix the configuration file and restart the app")
                }
            } else {
                this.error.push(error.reason)
            }
        }
    },
    watch: {
        connectedToServer() {
            this.checkIfLoadingComplete();
        },
        retrievedSteamId() {
            this.checkIfLoadingComplete();
        },
        retrievedSteamName() {
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
