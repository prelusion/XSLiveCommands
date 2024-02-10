<template>
    <div v-if="joiningInProgress" id="loading">
        Joining room...
    </div>
    <div v-else>
        <div class="join-input">
            <InputField
                type="text"
                name="room-code"
                placeholder="Room Code"
                :rules="['max:30']"
                :errorMsg="[errorMsg]"
                @onValueUpdated="roomId = $event"
            />
        </div>

        <Buttons :buttonConfig="buttonConfig"></Buttons>
    </div>
</template>

<script lang="ts">
import Buttons from "../../components/Buttons.vue";
import {defineComponent} from "vue";
import {changeTitle} from "../../util/general";
import {ButtonConfig} from "../../types/buttons";
import {SocketHandler} from "../../classes/socket-handler";
import InputField from "../forms/InputField.vue";
import HasInputFields from "../../mixins/HasInputFields";
import {GameHandler} from "../../classes/game-handler";

export default defineComponent({
    name: "Join",
    mixins: [HasInputFields],
    components: {InputField, Buttons},
    props: {},
    data() {
        return {
            roomId: "",
            joiningInProgress: false,
            errorMsg: "",
            buttonConfig: [
                {
                    text: "Join",
                    callback: (): void => {
                        if (!this.validateInputs()) {
                            return;
                        }

                        this.joinRoom();
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
        changeTitle(`Join as Player...`);
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
