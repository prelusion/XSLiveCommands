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
        </table>
        <Buttons :buttonConfig="buttonConfig"></Buttons>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Buttons from "@/components/Buttons.vue";
import {SocketHandler} from "@/classes/socket-handler";
import {assert, ensure} from "@/util/general";
import {GameHandler} from "@/classes/game-handler";

export default defineComponent({
    name: "join",
    components: {Buttons},
    props: {},
    data() {
        return {
            roomId: "asd",
            joiningInProgress: false,
            errorMsg: "",
            buttonConfig: [
                {
                    window: 'Main',
                    text: 'Leave room',
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
        resetWindow() {
            this.roomId = "";
            this.joiningInProgress = false;
            this.errorMsg = "";
        },
        joinRoom() {
            this.joiningInProgress = true;
            SocketHandler.instance.joinRoom(this.roomId)
                .then(() => {
                    this.resetWindow();
                    this.$store.commit("changeWindow", "Joined");
                })
                .catch((reason) => {
                    this.joiningInProgress = false;
                    this.errorMsg = reason;
                })
        }
    },
    watch: {}
})

</script>

<style scoped lang="scss">
#loading {
    width: 100%;
    text-align: center;
}

#error-msg {
    margin-top: 3px;
    color: red;
}

input {
    padding: 4px;
}
</style>
