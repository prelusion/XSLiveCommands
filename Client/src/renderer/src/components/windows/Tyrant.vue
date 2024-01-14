<template>
    <div v-if="joiningInProgress" id="loading">
        Joining room...
    </div>
    <div v-else>
        <div>
            <input placeholder="Room Code" v-model="roomId">
        </div>

        <div id="password-field">
            <div>
                <input placeholder="Password"  v-model="roomPassword" v-bind:type="passwordType">
            </div>
            <div id="show-password">
                <label>
                    <input v-model="showPassword" type="checkbox"> Show password
                </label>
            </div>
        </div>

        <div id="error-msg" v-if="errorMsg" v-html="errorMsg"></div>

        <Buttons :buttonConfig="buttonConfig"></Buttons>
    </div>
</template>

<script lang="ts">
import {SocketHandler} from "../../classes/socket-handler";
import Buttons from "../../components/Buttons.vue";
import {defineComponent} from "vue";
import {changeTitle} from "../../util/general";
import {ButtonConfig} from "../../interfaces/buttons";

export default defineComponent({
    name: "Tyrant",
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
                    text: "Join",
                    callback: () => {
                        this.joinRoom();
                    },
                },
                {
                    window: "MainRoom",
                    text: "Cancel",
                }
            ] as Array<ButtonConfig>,
        };
    },
    mounted() {
        changeTitle(`Join as Tyrant...`);
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
    margin-top: 10px;
    color: red;
}

#password-field {
    display: flex;
    margin-top: 5px;
    align-items: center;

    div {
        margin-top: 5px;
    }

    #show-password {
        user-select: none;
    }
}

input {
    padding: 5px;
}
</style>
