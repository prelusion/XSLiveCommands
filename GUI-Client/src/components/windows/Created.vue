<template>
    <div>
        <table>
            <tr>
                <td>Room ID:</td>
                <td>{{ SocketHandler.room?.id }}</td>
            </tr>
            <tr>
                <td>Scenario:</td>
                <td>{{ SocketHandler.room?.scenario }}</td>
            </tr>
            <tr>
                <td>Connected:</td>
                <td>{{ SocketHandler.room?.connections.length }}</td>
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
import {assert} from "@/util/general";

export default defineComponent({
    name: "Created",
    components: {Buttons},
    props: {},
    data() {
        return {
            buttonConfig: [
                {
                    window: 'Main',
                    text: 'Disconnect',
                    callback: () => {
                        assert(SocketHandler.instance.room);

                        GameHandler.instance.resetState(SocketHandler.instance.room.scenario);
                        // Todo: Server side needs a leaveRooms functionality
                    },
                },
            ] as Array<ButtonConfig>,
        }
    },
    mounted() {
        // Execute on creation
    },
    computed: {
        SocketHandler() {
            return SocketHandler.instance;
        }
    },
    methods: {},
    watch: {}
})

</script>

<style scoped lang="scss">

</style>
