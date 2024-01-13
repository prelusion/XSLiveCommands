<template>
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
        <Buttons :buttonConfig="buttonConfig"></Buttons>
    </div>
</template>

<script lang="ts">
import {GameHandler} from "../../classes/game-handler";
import {QueueHandler} from "../../classes/queue-handler";
import {SocketHandler} from "../../classes/socket-handler";
import Buttons from "../../components/Buttons.vue";
import {changeTitle} from "../../util/general";
import {defineComponent} from "vue";
import {CommandEvent} from "../../../../shared/src/types/command";
import {ButtonConfig} from "../../interfaces/buttons";
import {assert, ensure} from "../../../../shared/src/util/general";

export default defineComponent({
    name: "Room",
    components: {Buttons},
    props: {},
    data() {
        return {
            numberOfConnectedClients: 0,
            asHost: false,
            tyrantMode: {
                enabled: false,
                progress: 0,
                word: ['t', 'y', 'r', 'a', 'n', 't']
            },
            buttonConfig: [
                {
                    window: "MainWindow",
                    text: "Disconnect",
                    callback: async () => {
                        assert(SocketHandler.instance.room);

                        await SocketHandler.instance.leaveRoom();
                        await GameHandler.instance.resetState(SocketHandler.instance.room.map);
                    },
                },
            ] as Array<ButtonConfig>,
        };
    },
    mounted() {
        const room = ensure(SocketHandler.instance.room);
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