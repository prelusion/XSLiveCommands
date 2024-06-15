<script setup lang="ts">
import Buttons from "../../components/Buttons.vue";
import {changeTitle} from "../../util/general";
import {onMounted, onUnmounted, ref} from "vue";
import {ButtonConfig} from "../../types/buttons";
import {SocketId} from "../../types/player";
import {UserServerAction} from "@renderer/util/user-server-action";
import {ensure} from "../../../shared/src/util/general";
import {Room} from "../../../shared/src/types/room";
import {useRouter} from "vue-router";
import {Route} from "@renderer/router/routes";
import {useMainStore} from "@store/main";
import CustomModal from "@renderer/components/modal/CustomModal.vue";
import Password from "@renderer/components/modal/content/Password.vue";
import DisconnectButton from "@renderer/components/DisconnectButton.vue";

const store = useMainStore();
const router = useRouter();
const passwordModal = ref(null as typeof CustomModal | null);
const errorMsg = ref("");
const room = ref(Room.new());
const ownSocketId = ref(UserServerAction.skt?.id);

/* Copy button */
const copyButtonText = ref('Copy');
let buttonTimeout = -1;

const updateRoom = (updatedRoom: Room | null) => {
    if (updatedRoom) {
        room.value = updatedRoom;
        return;
    }

    router.replace({
        name: Route.MAIN,
        query: {
            message: 'The server does not recognize the room anymore, please join or create a new one.'
        }
    });
};

onMounted(async () => {
    room.value = ensure(UserServerAction.room);

    console.log(UserServerAction.room)

    UserServerAction.onRoomUpdate(updateRoom);
    changeTitle(`Room ${room.value.id}`);
});

onUnmounted(async () => {
    UserServerAction.offRoomUpdate(updateRoom);
});

const copyRoomId = async () => {
    clearTimeout(buttonTimeout);

    await window.clipboard.write(room.value.id);

    copyButtonText.value = 'Copied!';
    buttonTimeout = setTimeout(() => copyButtonText.value = 'Copy', 2000) as unknown as number;
};

const showPasswordModal = () => {
    const modal = passwordModal.value as typeof CustomModal;

    modal.open();
};

const closePasswordModal = () => {
    const modal = passwordModal.value as typeof CustomModal;

    modal.close();
};

const startTyrantRequest = (): void => {
    /* If this room has already had a login */
    if (store.tyrantRequest.roomId === room.value.id) {
        requestTyrant(store.tyrantRequest.code);
        return;
    }

    showPasswordModal();
};

const submitTyrantRequest = (password: string) => {
    requestTyrant(password)
};

const requestTyrant = (password: string) => {
    UserServerAction.joinTyrant(password)
        .then(() => {
            store.tyrantRequest.roomId = room.value.id;
            store.tyrantRequest.code = password;

            router.replace({name: Route.COMMAND_CENTRE});
        })
        .catch((reason) => {
            store.tyrantRequest.code = '';
            errorMsg.value = reason;
        });
};

const disconnect = async () => {
    await UserServerAction.leaveRoom();

    await router.replace({name: Route.MAIN});
};

const buttonConfig = [
    {
        text: "Begin Tyranny",
        callback: (): void => {
            startTyrantRequest()
        }
    }
] as Array<ButtonConfig>;
</script>


<template>
    <disconnect-button @disconnect="disconnect"/>
    <div>
        <table>
            <tr>
                <td>Room Code:</td>
                <td>{{ room.id }}</td>
                <td>
                    <button @click="copyRoomId()">{{ copyButtonText }}</button>
                </td>
            </tr>
            <tr>
                <td>Map:</td>
                <td>{{ room.mapCtx.name }}</td>
            </tr>
        </table>
        <table id="player-list">
            <tr v-for="userId in room.playerIds">
                <td title="User is host">
                    {{ room.hostId === userId ? '👑' : '' }}
                </td>
                <td title="User is tyrant">
                    {{ room.isTyrant(userId) ? '💪' : '' }}
                </td>
                <td :style="{ fontWeight: userId === ownSocketId ? 'bold' : 'normal' }">
                    {{ room.getPlayerName(userId) }}
                </td>
            </tr>
        </table>
        <Buttons :buttonConfig="buttonConfig" :direction="'row-reverse'"></Buttons>
        <CustomModal ref="passwordModal">
            <Password @submit="submitTyrantRequest" @closeModal="closePasswordModal" :errorMsg="errorMsg"/>
        </CustomModal>
    </div>
</template>


<style scoped lang="scss">
table {
    tr {
        td:nth-child(2) {
            padding-left: 10px;
        }
    }
}

#player-list {
    margin-top: 10px;

    th, td {
        padding: 0;
        min-width: 22px;
    }
}
</style>
