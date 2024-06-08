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
let room = Room.new();

onMounted(async () => {
    room = ensure(UserServerAction.room);

    UserServerAction.onRoomUpdate(setRoom);
    changeTitle(`Room ${room.id}`);
});

onUnmounted(async () => {
    UserServerAction.offRoomUpdate(setRoom);
})

const setRoom = (newRoom: Room | null) => {
    if (newRoom) {
        room = newRoom;
        return;
    }

    router.push({
        name: Route.MAIN,
        query: {
            message: 'The server does not recognize the room anymore, please join or create a new one.'
        }
    });
};

const copyRoomId = () => {
    window.clipboard.write(room.id);
};

const handlePassword = (password: string) => {
    requestTyrant(password)
};

const showPasswordModal = () => {
    const modal = passwordModal.value as typeof CustomModal;

    modal.open();
};

const closePasswordModal = () => {
    const modal = passwordModal.value as typeof CustomModal;

    modal.close();
};

const startRequestTyrant = (): void => {
    /* If this room has already had a login */
    if (store.tyrantRequest.roomId === room.id) {
        requestTyrant(store.tyrantRequest.code);
        return;
    }

    showPasswordModal();
};

const requestTyrant = (password: string) => {
    UserServerAction.joinTyrant(password)
        .then(() => {
            store.tyrantRequest.roomId = room.id;
            store.tyrantRequest.code = password;

            router.push({name: Route.COMMAND_CENTRE});
        })
        .catch((reason) => {
            store.tyrantRequest.code = '';
            errorMsg.value = reason;
        });
};

const disconnect = async () => {
    await UserServerAction.leaveRoom();

    router.push({name: Route.MAIN});
};

const getSelfUserId = (): SocketId => {
    return ensure(UserServerAction.skt?.id);
}

const buttonConfig = [
    {
        text: "Begin Tyranny",
        callback: (): void => {
            startRequestTyrant()
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
                    <button @click="copyRoomId()">Copy</button>
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
                <td :style="{ fontWeight: userId === getSelfUserId() ? 'bold' : 'normal' }">
                    {{ room.getPlayerName(userId) }}
                </td>
            </tr>
        </table>
        <Buttons :buttonConfig="buttonConfig" :direction="'row-reverse'"></Buttons>
        <CustomModal ref="passwordModal">
            <Password @submit="handlePassword" @closeModal="closePasswordModal" :errorMsg="errorMsg"/>
        </CustomModal>
    </div>
</template>


<style scoped lang="scss">
table {
    tr {
        //td:first-child {
        //    text-align: right;
        //}

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
