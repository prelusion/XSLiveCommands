<template>
    <div v-if="joiningInProgress" id="loading">
        Joining room...
    </div>
    <div v-else>
        <label>
            Enter the room ID you want to join: <br/>
            <input v-model="roomId"> <br/>
            Enter the password: <br/>
            <input v-model="roomPassword" v-bind:type="passwordType">

            <label><input type="checkbox" v-model="showPassword"> Show password</label>

        </label><br/>
        <div id="error-msg" v-if="errorMsg" v-html="errorMsg"></div>

        <Buttons :buttonConfig="buttonConfig"></Buttons>
    </div>
</template>

<script lang="ts">
import {SocketHandler} from "@/classes/socket-handler";
import Buttons from "@/components/Buttons.vue";
import {defineComponent} from "vue";

export default defineComponent({
    name: "JoinTyrant",
    components: {Buttons},
    props: {},
    data() {
        return {
            roomId: "",
            roomPassword: "",
            showPassword: false,
            joiningInProgress: false,
            errorMsg: "",
            buttonConfig: [
                {
                    window: "Main",
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
        console.log("Mounted");

        // Execute on creation
    },
    computed: {
        passwordType(): string {
            return this.showPassword ? "text" : "password";
        }
    },
    methods: {
        joinRoom() {
            this.joiningInProgress = true;
            SocketHandler.instance.joinRoomAsTyrant(this.roomId, this.roomPassword)
                .then(() => {
                    this.$store.commit("changeWindow", "CommandCentre");
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
    padding: 4px;
}
</style>
