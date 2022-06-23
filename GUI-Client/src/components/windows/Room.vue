<template>
    <div>
        <table>
            <tr>
                <td>Room ID:</td>
                <td>{{ ensure(SocketHandler.room).id }}</td>
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

        ensure(SocketHandler.instance.socket).on('room-connection-update', (n: number) => {
            this.numberOfConnectedClients = n;
        })
    },
    computed: {
        SocketHandler() {
            return SocketHandler.instance;
        }
    },
    methods: {
        ensure,
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
