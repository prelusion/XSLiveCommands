<template>
    <div>
        <table>
            <tr>
                <td>Room ID:</td>
                <td>{{ ensure(SocketHandler.room).id }}</td>
                <td>
                    <button @click="copyRoomId()">Copy</button>
                </td>
            </tr>
            <tr>
                <td>Scenario:</td>
                <td>{{ ensure(SocketHandler.room).scenario }}</td>
            </tr>
            <tr>
                <td>Number of connected players:</td>
                <td> {{ numberOfConnectedClients }} </td>
            </tr>
        </table>
        <Buttons :buttonConfig="buttonConfig"></Buttons>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Buttons from "@/components/Buttons.vue";
import {SocketHandler} from "@/classes/socket-handler";
import {GameHandler} from "@/classes/game-handler";
import {assert, ensure} from "@/util/general";
import {CommandEvent} from "@/interfaces/general";
import {QueueHandler} from "@/classes/queue-handler";

export default defineComponent({
    name: "Room",
    components: {Buttons},
    props: {},
    data() {
        return {
            numberOfConnectedClients: 0,
            buttonConfig: [
                {
                    window: 'Main',
                    text: 'Disconnect',
                    callback: async () => {
                        assert(SocketHandler.instance.room);

                        await SocketHandler.instance.leaveRoom();
                        await GameHandler.instance.resetState(SocketHandler.instance.room.scenario);
                    },
                },
            ] as Array<ButtonConfig>,
        }
    },
    mounted() {
        this.numberOfConnectedClients = ensure(SocketHandler.instance.room).numberOfConnections;
        const socket = ensure(SocketHandler.instance.socket);

        socket.on('room-connection-update', (n: number) => {
            this.numberOfConnectedClients = n;
        })

        socket.on('event', (commandEvent: CommandEvent) => {
            console.log("Event registered!")
            QueueHandler.instance.enqueue(commandEvent);
        })
    },
    computed: {
        SocketHandler() {
            return SocketHandler.instance;
        }
    },
    methods: {
        ensure,
        copyRoomId() {
            window.clipboard.write(ensure(SocketHandler.instance.room).id)
        }
    },
    watch: {}
})

</script>

<style scoped lang="scss">
table {
    tr {
        td:first-child {
            text-align: right;
        }

        td:nth-child(2) {
            padding-left: 10px;
        }
    }
}
</style>
