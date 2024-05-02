<template>
    <disconnect-button @disconnect="disconnect"/>
    <div>
        <table>
            <tr>
                <td>Room Code:</td>
                <td>{{ roomId }}</td>
                <td>
                    <button @click="copyRoomId()">Copy</button>
                </td>
            </tr>
            <tr>
                <td>Map:</td>
                <td>{{ mapName }}</td>
            </tr>
        </table>
        <table id="player-list">
            <tr v-for="userId in room.playerIds">
                <td title="User is host">
                    {{ room.hostId === userId ? '👑' : ''}}
                </td>
                <td title="User is tyrant">
                    {{ room.isTyrant(userId) ? '💪' : ''}}
                </td>
                <td :style="{ fontWeight: userId === selfUserId ? 'bold' : 'normal' }">
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

<script lang="ts">
import Buttons from "../../components/Buttons.vue";
import {changeTitle} from "../../util/general";
import {defineComponent} from "vue";
import {ButtonConfig} from "../../types/buttons";
import {ensure} from "../../../../shared/src/util/general";
import CustomModal from "../modal/CustomModal.vue";
import Password from "../modal/content/Password.vue";
import DisconnectButton from "../DisconnectButton.vue";
import {UserServerAction} from "../../classes/user-server-action";
import {SocketId} from "../../types/player";
import {Room} from "../../../../shared/src/types/room";


export default defineComponent({
    name: "Room",
    components: {DisconnectButton, Password, CustomModal, Buttons},
    props: {},
    data() {
        return {
            errorMsg: "",
            buttonConfig: [
                {
                    text: "Begin Tyranny",
                    callback: (): void => {
                        this.startRequestTyrant()
                    }
                }
            ] as Array<ButtonConfig>,
            get room(): Room {
                return ensure(UserServerAction.room);
            },
            get selfUserId(): SocketId {
                return ensure(UserServerAction.skt?.id);
            }
        };
    },
    mounted() {
        changeTitle(`Room ${this.room.id}`);
    },
    computed: {
        roomId() {
            return this.room.id;
        },
        mapName() {
            return this.room.mapCtx.name;
        },
    },
    methods: {
        copyRoomId() {
            window.clipboard.write(this.roomId);
        },
        handlePassword(password: string) {
            this.requestTyrant(password)
        },
        showPasswordModal() {
            const modal = this.$refs.passwordModal as CustomModal;

            modal.open();
        },
        closePasswordModal() {
            const modal = this.$refs.passwordModal as CustomModal;

            modal.close();
        },
        startRequestTyrant(): void {
            /* If this room has already had a login */
            if (this.$store.state.tyrantRequest.roomId === this.room.id) {
                this.requestTyrant(this.$store.state.tyrantRequest.code);
                return;
            }

            this.showPasswordModal();
        },
        requestTyrant(password: string) {
            UserServerAction.joinTyrant(password)
                .then(() => {
                    this.$store.state.tyrantRequest.roomId = this.room.id;
                    this.$store.state.tyrantRequest.code = password;

                    this.$store.commit("changeWindow", "CommandCentre");
                })
                .catch((reason) => {
                    this.$store.state.tyrantRequest.code = '';
                    this.errorMsg = reason;
                });
        },
        async disconnect() {
            await UserServerAction.leaveRoom();

            this.$store.commit("changeWindow", "MainRoom");
        },
    },
    watch: {},
});

</script>

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
