<template>
    <div v-if="joiningInProgress" id="loading">
        Joining room...
    </div>
    <div v-else>
        <label>
            Enter the room ID you want to join: <br/>
            <input v-model="roomId">
        </label><br/>
        <div id="error-msg" v-if="errorMsg" v-html="errorMsg"></div>

        <Buttons :buttonConfig="buttonConfig"></Buttons>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Buttons from "@/components/Buttons.vue";
import {SocketHandler} from "@/classes/socket-handler";

export default defineComponent({
    name: "join",
    components: {Buttons},
    props: {},
    data() {
        return {
            roomId: "",
            joiningInProgress: false,
            errorMsg: "",
            buttonConfig: [
                {
                    window: "Main",
                    text: "Cancel",
                },
                {
                    text: "Join room",
                    callback: () => {
                        this.joinRoom();
                    },
                },
            ] as Array<ButtonConfig>,
        }
    },
    mounted() {
        console.log("Mounted")

        // Execute on creation
    },
    computed: {},
    methods: {
        joinRoom() {
            this.joiningInProgress = true;
            SocketHandler.instance.joinRoom(this.roomId)
                .then(() => {
                    this.$store.commit("changeWindow", "Room");
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
