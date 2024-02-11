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
            <tr v-for="(connection, socketId) in room.connections" v-bind:key="socketId">
                <td title="User is host">
                    {{ room.host === socketId ? '👑' : ''}}
                </td>
                <td title="User is tyrant">
                    {{ connection.tyrant ? '💪' : ''}}
                </td>
                <td :style="{ fontWeight: socketId === ownSocketId ? 'bold' : 'normal' }">
                    {{ connection.name }}
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
import {QueueHandler} from "../../classes/queue-handler";
import {SocketHandler} from "../../classes/socket-handler";
import Buttons from "../../components/Buttons.vue";
import {changeTitle} from "../../util/general";
import {defineComponent} from "vue";
import {CommandEvent} from "../../../../shared/src/types/command";
import {ButtonConfig} from "../../types/buttons";
import {assert, ensure} from "../../../../shared/src/util/general";
import CustomModal from "../modal/CustomModal.vue";
import Password from "../modal/content/Password.vue";
import {GameHandler} from "../../classes/game-handler";
import DisconnectButton from "../DisconnectButton.vue";
import {Room} from "../../types/room";
import {Socket} from "socket.io-client";
import {RoomPlayer, SocketId} from "../../types/player";


export default defineComponent({
    name: "Room",
    components: {DisconnectButton, Password, CustomModal, Buttons},
    props: {},
    data() {
        return {
            room: {} as Room,
            errorMsg: "",
            buttonConfig: [
                {
                    text: "Begin Tyranny",
                    callback: (): void => {
                        this.startRequestTyrant()
                    }
                }
            ] as Array<ButtonConfig>,
        };
    },
    mounted() {
        const room = ensure(SocketHandler.instance.room);

        this.room = room;

        const socket = ensure(SocketHandler.instance.socket);

        socket.on("room-connection-update", this.roomConnectionUpdate);
        socket.on("event", this.eventRegistered);

        changeTitle(`Room ${room.id}`);
    },
    unmounted() {
        const socket = ensure(SocketHandler.instance.socket);

        socket.off("room-connection-update", this.roomConnectionUpdate);
        socket.off("event", this.eventRegistered);
    },
    computed: {
        roomId() {
            return ensure(SocketHandler.instance.room).id
        },
        mapName() {
            assert(SocketHandler.instance.room);

            return ensure(SocketHandler.instance.room.map).name;
        },
        ownSocketId() {
            const socket = ensure(SocketHandler.instance.socket);
            return ensure(socket.id);
        }
    },
    methods: {
        ensure,
        copyRoomId() {
            window.clipboard.write(ensure(SocketHandler.instance.room).id);
        },
        roomConnectionUpdate(room: Room) {
            this.room = room;
        },
        eventRegistered(commandEvent: CommandEvent) {
            console.log("Event registered!");
            console.log(commandEvent);
            QueueHandler.instance.enqueue(commandEvent);
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
            assert(SocketHandler.instance.room);

            /* If this room has already had a login */
            if (this.$store.state.tyrantRequest.roomId === this.room.id) {
                this.requestTyrant(this.$store.state.tyrantRequest.code);
                return;
            }

            this.showPasswordModal();
        },
        requestTyrant(password: string) {
            SocketHandler.instance.becomeTyrant(this.room.id, password)
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
            const room = ensure(SocketHandler.instance.room);

            await SocketHandler.instance.leaveRoom();
            if (room.map) {
                await GameHandler.instance.resetState(room.map);
            }

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
