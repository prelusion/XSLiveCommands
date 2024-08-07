<script setup lang="ts">
import Buttons from "../../components/Buttons.vue";
import {onMounted, ref} from "vue";
import {changeTitle} from "../../util/general";
import {ButtonConfig} from "../../types/buttons";
import {UserServerAction} from "@renderer/util/user-server-action";
import {useRouter} from "vue-router";
import {Route} from "@renderer/router/routes";
import {validateInputs} from "@renderer/util/form/validation";
import {assert} from "../../../shared/src/util/general";
import InputField from "@renderer/components/InputField.vue";

const router = useRouter();
const joiningInProgress = ref(false);
const inputRoomCode = ref<typeof InputField | null>(null);
const errorMsg = ref("");
const roomId = ref("");

onMounted(async () => {
    assert(inputRoomCode.value);

    changeTitle(`Join Room...`);

    inputRoomCode.value.focus();
});

const joinRoom = (): void => {
    joiningInProgress.value = true;

    UserServerAction.joinRoom(roomId.value)
        .then(() => {
            router.replace({name: Route.ROOM});
        })
        .catch((reason) => {
            joiningInProgress.value = false;
            errorMsg.value = reason;
        });
}

const buttonConfig = [
    {
        text: "Join",
        callback: (): void => {
            if (!validateInputs([inputRoomCode.value])) {
                return;
            }

            joinRoom();
        },
    },
    {
        route: Route.MAIN,
        text: "Cancel",
    },
] as Array<ButtonConfig>;
</script>


<template>
    <div id="join">
        <div v-if="joiningInProgress" id="loading">
            Joining room...
        </div>
        <div v-else>
            <div class="join-input">
                <InputField
                    ref="inputRoomCode"
                    type="custom-password"
                    name="room-code"
                    placeholder="Room Code"
                    label="Room Code"
                    subtext="Enter the code for the room. This code is shown to the host and others who are already in the room."
                    :rules="['required', 'max:30']"
                    :errorMsg="[errorMsg]"
                    v-model="roomId"
                />
            </div>

            <Buttons :buttonConfig="buttonConfig"></Buttons>
        </div>
    </div>
</template>

<style scoped lang="scss">
#join {
    padding: 20px;

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
}
</style>
