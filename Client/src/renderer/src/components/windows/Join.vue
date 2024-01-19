<template>
    <div v-if="joiningInProgress" id="loading">
        Joining room...
    </div>
    <div v-else>
        <div class="join-input">
            <InputField
                :type="'text'"
                :placeholder="'Room Code'"
                :rules="['max:30']"
                :errorMsg="[errorMsg]"
                @updateValue="roomId = $event"
                @validationStatus="validationStatus = $event"
            />
        </div>

        <Buttons :buttonConfig="buttonConfig"></Buttons>
    </div>
</template>

<script lang="ts">
import Buttons from "../../components/Buttons.vue";
import {defineComponent} from "vue";
import {changeTitle} from "../../util/general";
import {ButtonConfig} from "../../interfaces/buttons";
import {SocketHandler} from "../../classes/socket-handler";
import InputField from "../formComponents/InputField.vue";

export default defineComponent({
    name: "Join",
    components: {InputField, Buttons},
    props: {},
    data() {
        return {
            roomId: "",
            joiningInProgress: false,
            errorMsg: "",
            validationStatus: true,
            buttonConfig: [
                {
                    text: "Join",
                    callback: () => {
                        if (this.validationStatus) {
                            this.joinRoom();
                        }
                    },
                },
                {
                    window: "MainRoom",
                    text: "Cancel",
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

.join-input {
    width: 40%;
}

input {
    padding: 5px;
}
</style>
