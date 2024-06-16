<script setup lang="ts">
import Buttons from "../../components/Buttons.vue";
import {changeTitle} from "../../util/general";
import {onMounted, onUnmounted, ref} from "vue";
import {ButtonConfig} from "../../types/buttons";
import {UserServerAction} from "@renderer/util/user-server-action";
import {ensure} from "../../../shared/src/util/general";
import {Room} from "../../../shared/src/types/room";
import {useRouter} from "vue-router";
import {Route} from "@renderer/router/routes";
import {useMainStore} from "@store/main";
import CustomModal from "@renderer/components/modal/CustomModal.vue";
import Password from "@renderer/components/modal/content/Password.vue";
import RoomHeader from "@renderer/components/RoomHeader.vue";

const {setTimeout, clearTimeout} = window;

const store = useMainStore();
const router = useRouter();
const passwordModal = ref<typeof CustomModal | null>(null);
const errorMsg = ref("");
const room = ref<Room>(Room.new());
const ownSocketId = ref(UserServerAction.skt?.id);

/* Copy button */
const copyButtonText = ref('Copy');
let buttonTimeout = -1;

const updateRoom = (updatedRoom: Room | null) => {
    if (updatedRoom !== null) {
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
    buttonTimeout = setTimeout(() => copyButtonText.value = 'Copy', 2000);
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
    <div>
        <div>
            <RoomHeader :room="room as Room"></RoomHeader>
        </div>
        <div id="content">
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

#content {
    padding: 20px;
}

#player-list {
    th, td {
        padding: 0;
        min-width: 22px;
    }
}
</style>
