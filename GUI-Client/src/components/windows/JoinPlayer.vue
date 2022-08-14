<template>
    <div v-if="joiningInProgress" id="loading">
        Joining room...
    </div>
    <div v-else>
        <div>
            <input placeholder="Room Code" v-model="roomId">
        </div>
        <div id="error-msg" v-if="errorMsg" v-html="errorMsg"></div>

        <Buttons :buttonConfig="buttonConfig"></Buttons>
    </div>
</template>

<script lang="ts">
import {SocketHandler} from "@/classes/socket-handler";
import Buttons from "@/components/Buttons.vue";
import {defineComponent} from "vue";
import {changeTitle} from "@/util/general";
import {ButtonConfig} from "../../interfaces/buttons";

export default defineComponent({
    name: "joinPlayer",
    components: {Buttons},
    props: {},
    data() {
        return {
            roomId: "",
            joiningInProgress: false,
            errorMsg: "",
            buttonConfig: [
                {
                    window: "MainWindow",
                    text: "Cancel",
                },
                {
                    text: "Join",
                    callback: () => {
                        this.joinRoom();
                    },
                },
            ] as Array<ButtonConfig>,
        };
    },
    mounted() {
        // Execute on creation

        changeTitle(`Join as Player...`);
    },
    computed: {},
    methods: {
        joinRoom() {
            this.joiningInProgress = true;
            SocketHandler.instance.joinRoomAsPlayer(this.roomId)
                .then(() => {
                    this.$store.commit("changeWindow", "Room");
                })
                .catch((reason) => {
                    this.joiningInProgress = false;
                    this.errorMsg = reason;
                });
        },
    },
    watch: {},
});

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
    padding: 5px;
}
</style>
