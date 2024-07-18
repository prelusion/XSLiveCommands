<script setup lang="ts">
import ConfigReset from "@renderer/components/modal/content/ConfigReset.vue";
import CustomModal from "@renderer/components/modal/CustomModal.vue";
import {Route} from "@renderer/router/routes";
import {changeTitle} from "@renderer/util/general";
import {UserServerAction} from "@renderer/util/user-server-action";
import {CONFIG_VERSION} from "@renderer/versions";
import {useMainStore} from "@store/main";
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {Compatibility} from "../../../shared/src/types/version";
import {ensure, sleep} from "../../../shared/src/util/general";


const store = useMainStore();
const router = useRouter();
const configResetModal = ref<typeof CustomModal|null>(null);

changeTitle('');

/* The texts showing on screen during the startup sequence */
const outdatedWarningTime = ref(0);
const loadingError = ref('');
const loadingTexts = ref({
    settings: 'Loading configuration file...',
    userId: '',
    serverConnected: '',
    username: '',
});

onMounted(async () => {
    changeTitle('Loading...');

    /* ############# Load configuration file ############# */
    const version = parseFloat(CONFIG_VERSION);
    const result = await window.config.readConfig(version);
    if (result.isError) {
        handleConfigError(result.error);
        return;
    }

    /* Store the config in the store */
    const config = store.$state.config = result.value

    loadingTexts.value.settings = "Configuration file loaded successfully!";
    loadingTexts.value.userId = "Loading user ID...";

    /* ############# Get User ID (Steam only for now) ############# */
    await UserServerAction.setPlatform();
    if (!UserServerAction.platform) {
        loadingError.value = 'Unable to detect platform. Make sure you\'re signed into Steam.'
        return;
    }

    loadingTexts.value.userId = "User ID loaded successfully!";
    loadingTexts.value.serverConnected = "Connecting to server...";

    /* ############# Connect to server and retrieve username ############# */
    const customUrl = config["custom-server-hostport"];
    await UserServerAction.connect(customUrl, reconnectCallback);
    loadingTexts.value.serverConnected = "Connection success!";
});

const handleConfigError = (error: string): void => {
    loadingError.value = error;

    if (error === "Invalid configuration file") {
        const modal = ensure(configResetModal.value);
        modal.open();
    }
}

/**
 * This will run on any type of connection, including initial load and after losing connection to the server
 */
const reconnectCallback = async (): Promise<void> => {
    const compatible = await UserServerAction.checkVersion();
    if(compatible == Compatibility.Compatible) {
        loadingError.value = "XSLC app version incompatible with the XSLC server";
        UserServerAction.connected = false;
        UserServerAction.username = null;
        return;
    }
    if(compatible == Compatibility.Outdated) {
        const waitTime = parseInt(ensure(await window.manager.getEnvVar('UPDATE_NOTIFICATION_TIME')));
        outdatedWarningTime.value = waitTime;

        let itv = setInterval(() => --outdatedWarningTime.value, 1000);
        await sleep(waitTime);
        clearInterval(itv);
    }
    store.$state.connectionOk = UserServerAction.connected;
    if (!UserServerAction.connected) {
        loadingError.value = "Disconnected from XSLC server, attempting to reconnect";
        return;
    }
    loadingTexts.value.serverConnected = "Connected to server successfully!";
    if (UserServerAction.username !== null) {
        loadingTexts.value.username = "Username loaded successfully!";
    }

    /* If reconnecting while on the loading route, redirect to main route */
    if (router.currentRoute.value.name === Route.LOADING) {
        router.replace({ name: Route.MAIN })
    }
}
</script>

<template>
    <div id="loading">
        <div v-for="text of loadingTexts">
            {{ text }}
        </div>
        <div id="error">{{ loadingError }}</div>

        <div id="warn" v-if="outdatedWarningTime > 0">
            <div>({{ outdatedWarningTime }}s)</div>
            <div>An update for the XSLC app is available!</div>
            <div>Download it from <a target="_blank" href="https://github.com/prelusion/XSLiveCommands/releases/latest">here</a>!</div>
        </div>
    </div>

    <CustomModal ref="configResetModal" :outside-click-close="false">
        <ConfigReset @submit=""/>
    </CustomModal>
</template>

<style scoped lang="scss">
#loading {
    width: 100%;
    min-height: 20vh;
    margin-top: 30vh;
    text-align: center;

    #error {
        margin-top: 20vh;
        color: red;
    }

    #warn {
        margin-top: 20vh;
        color: orange;
    }
}
</style>
