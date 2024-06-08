<script setup lang="ts">
import {onMounted, ref} from "vue";
import {changeTitle} from "@renderer/util/general";
import {CONFIG_VERSION} from "@renderer/versions";
import {UserServerAction} from "@renderer/util/user-server-action";
import {useMainStore} from "@store/main";
import {useRouter} from "vue-router";
import {Route} from "@renderer/router/routes";
import CustomModal from "@renderer/components/modal/CustomModal.vue";
import ConfigReset from "@renderer/components/modal/content/ConfigReset.vue";
import {ensure} from "../../../shared/src/util/general";

const store = useMainStore();
const router = useRouter();
const configResetModal = ref(null as typeof CustomModal|null);

changeTitle('');

/* The texts showing on screen during the startup sequence */
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
        loadingError.value = 'Unable to detect platform.'
        return;
    }

    loadingTexts.value.userId = "User ID loaded successfully!";
    loadingTexts.value.serverConnected = "Connecting to server...";

    /* ############# Connect to server and retrieve username ############# */
    const customUrl = config["custom-server-hostport"];
    await UserServerAction.connect(customUrl, reconnectCallback);
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
const reconnectCallback = (): void => {
    if (store.$state.connectionOk) {
        loadingTexts.value.serverConnected = "Connected to server successfully!";

        if (UserServerAction.username !== null) {
            loadingTexts.value.username = "Username loaded successfully!";
        }

        /* If reconnecting while on the loading route, redirect to main route */
        if (router.currentRoute.value.name === Route.LOADING) {
            router.push({ name: Route.MAIN })
        }
    }

    store.$state.connectionOk = UserServerAction.connected;
}
</script>

<template>
    <div id="loading">
        <div v-for="text of loadingTexts">
            {{ text }}
        </div>
        <div id="error">{{ loadingError }}</div>
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
}
</style>
