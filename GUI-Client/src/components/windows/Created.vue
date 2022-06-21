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
                <td>Connected:</td>
                <td>{{ ensure(SocketHandler.room).connections.length }}</td>
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
    name: "Created",
    components: {Buttons},
    props: {},
    data() {
        return {
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
        // Execute on creation
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

</style>
