<template>
    <div id="loading" v-html="loadingText"></div>

    <CustomModal ref="configResetModal" :outside-click-close="false">
        <ConfigReset @submit=""/>
    </CustomModal>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {CONFIG_VERSION} from "../../versions";
import {changeTitle, handle} from "../../util/general";
import {ConfigFileFormatNewest} from "../../../../shared/src/types/config";
import {MainErrorTypes} from "../../../../shared/src/util/errors";
import {MainError} from "../../../../shared/src/types/errors";
import CustomModal from "../modal/CustomModal.vue";
import ConfigReset from "../modal/content/ConfigReset.vue";
import {UserServerAction} from "../../classes/user-server-action";

export default defineComponent({
    name: "Loading",
    components: {ConfigReset, CustomModal},
    props: {},
    data() {
        return {
            timeout: -1,
            loadedSettings: false,
            error: [] as Array<string>,

            retrievedPlatform: false,
            retrievedName: false,
            connectedToServer: false,
        };
    },
    mounted: async function () {
        changeTitle("Loading...");

        const version = parseFloat(CONFIG_VERSION);

        /* Read config file */
        const result = await handle(window.config.readConfig(version));
        if (result.isError) {
            this.handleConfigError(result.value);
            return;
        }

        const config = result.value
        if (config.version) {
            this.$store.state.config = config as ConfigFileFormatNewest;
            this.loadedSettings = true;
        }

        await UserServerAction.setPlatform();
        if(UserServerAction.platform) {
            this.retrievedPlatform = true;
        }

        const customUrl = config["custom-server-hostport"];
        await UserServerAction.connect(customUrl, () => {
            if(this.connectedToServer) {
                this.retrievedName = UserServerAction.username !== null;
                this.isLoadingComplete();
            }
            this.$store.state.connectionOk = UserServerAction.connected;
            this.connectedToServer = UserServerAction.connected;
        });
    },
    computed: {
        loadingText() {
            let lines = [
                this.loadedSettings ? "Settings loaded successfully!": "Loading settings..."
            ];

            if (this.loadedSettings) {
                lines.push(this.retrievedPlatform ? "Steam ID loaded successfully!" : "Detecting Platform...")
                lines.push(this.connectedToServer ? "Connected to server successfully!": "Connecting to server...")
            } else {
                return lines.join("<br>");
            }

            if (this.connectedToServer) {
                lines.push(this.retrievedName ? "Username loaded successfully!" : "Retrieving username...")
            } else {
                return lines.join("<br>");
            }

            if (this.error.length > 0) {
                lines = lines.concat([""], this.error);
            }

            return lines.join("<br>");
        },
    },
    methods: {
        isLoadingComplete(): void {
            if (
                this.connectedToServer
                && this.loadedSettings
                && this.retrievedPlatform
                && this.retrievedName
            ) {
                setTimeout(() => this.$store.commit("changeWindow", "MainRoom"), 200);
            }
        },
        handleConfigError(error: MainError): void {
            if (error.type === MainErrorTypes.INVALID_CONFIG) {
                const modal = this.$refs.configResetModal as CustomModal;

                modal.open();
            } else {
                this.error.push(error.reason);
            }
        }
    },
});

</script>

<style scoped lang="scss">
#loading {
    width: 100%;
    text-align: center;
}
</style>
