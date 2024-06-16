<script setup lang="ts">

import {Room} from "../../shared/src/types/room";
import {PropType, ref} from "vue";
import DisconnectButton from "@renderer/components/DisconnectButton.vue";
import {UserServerAction} from "@renderer/util/user-server-action";
import {Route} from "@renderer/router/routes";
import {useRouter} from "vue-router";

const {setTimeout} = window;

const router = useRouter();

const props = defineProps({
    room: {
        type: Room,
        required: true,
    },
});

/* Copy button */
const copyButtonText = ref('Copy');
let buttonTimeout = -1;

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

</script>

<template>
    <div id="header">
        <disconnect-button @disconnect="disconnect"/>
        <div style="display: grid; grid-column-gap: 10px; grid-template-columns: repeat(2, fit-content(100%))">
            <div>Room Code:</div>
            <div>
                <span style="margin-right: 20px">{{ room.id }} </span>
                <button @click="copyRoomId()">{{ copyButtonText }}</button>
            </div>

            <div>Map:</div>
            <div>{{ room.mapCtx.name }}</div>
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
