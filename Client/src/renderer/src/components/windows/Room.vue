<template>
    <disconnect-button @disconnect="disconnect"/>
    <div>
        <table>
            <tr>
                <td>Room Code:</td>
                <td>{{ ensure(SocketHandler.room).id }}</td>
                <td>
                    <button @click="copyRoomId()">Copy</button>
                </td>
            </tr>
            <tr>
                <td>Map:</td>
                <td>{{ ensure(SocketHandler.room).map }}</td>
            </tr>
            <tr>
                <td>Players:</td>
                <td> {{ numberOfConnectedClients }}</td>
            </tr>
        </table>
        <Buttons :buttonConfig="buttonConfig" :reverse="true"></Buttons>
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
import {ButtonConfig} from "../../interfaces/buttons";
import {assert, ensure} from "../../../../shared/src/util/general";
import CustomModal from "../modal/CustomModal.vue";
import Password from "../modal/content/Password.vue";
import {GameHandler} from "../../classes/game-handler";
import DisconnectButton from "../DisconnectButton.vue";
import {roomAuth, updateRoomPassword} from '../../store/roomAuth';


export default defineComponent({
    name: "Room",
    components: {DisconnectButton, Password, CustomModal, Buttons},
    props: {},
    data() {
        return {
            roomId: ensure(SocketHandler.instance.room).id,
            errorMsg: "",
            numberOfConnectedClients: 0,
            asHost: false,
            tyrantMode: {
                enabled: false,
                progress: 0,
                word: ['t', 'y', 'r', 'a', 'n', 't']
            },
            buttonConfig: [
                {
                    text: "Begin Tyranny",
                    callback: async () => {
                        assert(SocketHandler.instance.room);
                        if (this.password) {
                            this.requestForTyrant(this.password)
                        }

                        this.showPasswordModal();
                    },
                }
            ] as Array<ButtonConfig>,
        };
    },
    mounted() {
        const room = ensure(SocketHandler.instance.room);
        roomAuth.roomId = room.id;
        this.numberOfConnectedClients = room.numberOfConnections;
        const socket = ensure(SocketHandler.instance.socket);

        const data = this.$store.state.data as { 'asHost': boolean };
        this.asHost = data?.asHost ?? false;

        socket.on("room-connection-update", this.roomConnectionUpdate);
        socket.on("event", this.eventRegistered);

        if (this.asHost) {
            document.addEventListener('keydown', this.enableTyrantModeControls);
        }

        changeTitle(`Room ${room.id}`);
    },
    unmounted() {
        const socket = ensure(SocketHandler.instance.socket);

        socket.off("room-connection-update", this.roomConnectionUpdate);
        socket.off("event", this.eventRegistered);
        if (this.asHost) {
            document.removeEventListener('keydown', this.enableTyrantModeControls);
        }
    },
    computed: {
        password: () => {
            const roomId = ensure(SocketHandler.instance.room).id;
            if(roomAuth.roomId === roomId) {
                return roomAuth.password
            } else {
                roomAuth.roomId = roomId
                return ""
            }
        },
        SocketHandler() {
            return SocketHandler.instance;
        },
    },
    methods: {
        ensure,
        copyRoomId() {
            window.clipboard.write(ensure(SocketHandler.instance.room).id);
        },
        roomConnectionUpdate(n: number) {
            this.numberOfConnectedClients = n;
        },
        eventRegistered(commandEvent: CommandEvent) {
            console.log("Event registered!");
            console.log(commandEvent);
            QueueHandler.instance.enqueue(commandEvent);
        },
        handlePassword(password: string) {
            this.requestForTyrant(password)
        },
        showPasswordModal() {
            this.$refs.passwordModal.open();
        },
        closePasswordModal() {
            this.$refs.passwordModal.close();
        },
        requestForTyrant(password: string) {
            SocketHandler.instance.becomeTyrant(this.roomId, password)
                .then(() => {
                    updateRoomPassword(password);
                    this.$store.commit("changeWindow", "CommandCentre");
                })
                .catch((reason) => {
                    this.errorMsg = reason;
                    updateRoomPassword("");
                });
        },
        async disconnect() {
            assert(SocketHandler.instance.room);

            await SocketHandler.instance.leaveRoom();
            await GameHandler.instance.resetState(SocketHandler.instance.room.map);
            this.$store.commit("changeWindow", "MainRoom");
        },
        enableTyrantModeControls(keyEvent: KeyboardEvent) {
            if (['Shift', 'Control', 'Alt'].includes(keyEvent.key))
                return;

            if (keyEvent.key === "T" && keyEvent.ctrlKey && keyEvent.shiftKey && !keyEvent.altKey && !keyEvent.metaKey) {
                this.tyrantMode.enabled = true;
                this.tyrantMode.progress = 0;
                return;
            }
            if (!this.tyrantMode.enabled) {
                return;
            }

            if (
                keyEvent.key === this.tyrantMode.word[this.tyrantMode.progress]
                && !keyEvent.altKey
                && !keyEvent.ctrlKey
                && !keyEvent.shiftKey
                && !keyEvent.metaKey
            ) {
                this.tyrantMode.progress++;

                if (this.tyrantMode.progress === this.tyrantMode.word.length) {
                    this.$store.commit('changeWindow', {
                        window: 'CommandCentre',
                        data: {
                            numberOfConnections: this.numberOfConnectedClients
                        }
                    });
                }
                return;
            }
            this.tyrantMode.progress = 0;
        }
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
</style>
