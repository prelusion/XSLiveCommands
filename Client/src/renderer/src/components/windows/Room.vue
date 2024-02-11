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
                <td>{{ ensure(SocketHandler.room).map?.name }}</td>
            </tr>
            <tr>
                <td>Players:</td>
                <td> {{ numberOfConnectedClients }}</td>
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


export default defineComponent({
    name: "Room",
    components: {DisconnectButton, Password, CustomModal, Buttons},
    props: {},
    data() {
        return {
            roomId: '',
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
                    callback: (): void => {
                        this.startRequestTyrant()
                    }
                }
            ] as Array<ButtonConfig>,
        };
    },
    mounted() {
        const room = ensure(SocketHandler.instance.room);
        console.log(room)
        this.roomId = room.id;

        this.numberOfConnectedClients = Object.keys(room.connections).length;
        const socket = ensure(SocketHandler.instance.socket);

        const data = this.$store.state.data as { 'asHost'?: boolean };
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
            if (this.$store.state.tyrantRequest.roomId as string === this.roomId) {
                this.requestTyrant(this.$store.state.tyrantRequest.code);
                return;
            }

            this.showPasswordModal();
        },
        requestTyrant(password: string) {
            SocketHandler.instance.becomeTyrant(this.roomId, password)
                .then(() => {
                    this.$store.state.tyrantRequest.roomId = this.roomId;
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
