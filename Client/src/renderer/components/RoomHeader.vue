<script setup lang="ts">

import {CoreLoop} from "@renderer/util/core-loop";
import {Room} from "../../shared/src/types/room";
import {onMounted, onUnmounted, ref} from "vue";
import DisconnectButton from "@renderer/components/DisconnectButton.vue";
import {UserServerAction} from "@renderer/util/user-server-action";
import {Route} from "@renderer/router/routes";
import {useRouter} from "vue-router";

const {setTimeout, setInterval} = window;

const router = useRouter();

const props = defineProps({
    room: {
        type: Room,
        required: true,
    },
});

/* Copy button */
const copyButtonText = ref('Copy');
const showRoomId = ref(false);
const localTick = ref<number>(-1);
let itv = -1;
let buttonTimeout = -1;

onMounted(async () => {
    itv = setInterval(() => {
        if(localTick.value !== UserServerAction.currentLocalTick) {
            localTick.value = UserServerAction.currentLocalTick
        }
    }, CoreLoop.READ_SPEED);
});

onUnmounted(async () => {
    clearInterval(itv);
});

const copyRoomId = async () => {
    clearTimeout(buttonTimeout);

    await window.clipboard.write(props.room.id);

    copyButtonText.value = 'Copied!';
    buttonTimeout = setTimeout(() => copyButtonText.value = 'Copy', 2000);
};

const disconnect = async () => {
    await UserServerAction.leaveRoom();

    await router.replace({name: Route.MAIN});
};

const onClickShowRoomIdEye = () => {
    showRoomId.value = !showRoomId.value;
};

</script>

<template>
    <div id="header">
        <disconnect-button @disconnect="disconnect"/>
        <div style="display: grid; grid-column-gap: 10px; grid-template-columns: repeat(2, fit-content(100%))">
            <div>Room Code:</div>
            <div>
                <span v-if="showRoomId" style="margin-right: 5px">{{ room.id }} </span>
                <i
                    :class="`fa-regular fa-fw ${showRoomId ? 'fa-eye-slash' : 'fa fa-eye'}`"
                    style="margin-right: 20px"
                    @click="onClickShowRoomIdEye"
                >

                </i>
                <button @click="copyRoomId()">{{ copyButtonText }}</button>
            </div>

            <div>Map:</div>
            <div>{{ room.mapCtx.file }}</div>

            <div>Game Status:</div>
            <div>{{ localTick >= 0 ? "Started!" : "Waiting..." }}</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
#header {
    width: 100%;
    border-bottom: 1px solid #b6b6b6;
    padding: 10px;
}
</style>
