<script setup lang="ts">
import Buttons from "../../components/Buttons.vue";
import {onMounted, ref} from "vue";
import {changeTitle} from "../../util/general";
import {ButtonConfig} from "../../types/buttons";
import InputField from "../forms/InputField.vue";
import {UserServerAction} from "@renderer/util/user-server-action";
import {useRouter} from "vue-router";
import {Route} from "@renderer/router/routes";
import {validateInputs} from "@renderer/util/form/validation";
import {assert} from "../../../shared/src/util/general";

const router = useRouter();
const joiningInProgress = ref(false);
const inputRoomCode = ref(null as typeof InputField | null);
const errorMsg = ref("");
const roomId: string = "";

onMounted(async () => {
    assert(inputRoomCode.value);

    changeTitle(`Join as Player...`);
    inputRoomCode.value.focus();
});

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
        window: "MainRoom",
        text: "Cancel",
    },
] as Array<ButtonConfig>;


const joinRoom = (): void => {
    joiningInProgress.value = true;

    UserServerAction.joinRoom(roomId)
        .then(() => {
            router.push({name: Route.ROOM});
        })
        .catch((reason) => {
            joiningInProgress.value = false;
            errorMsg.value = reason;
        });
}

</script>


<template>
    <div v-if="joiningInProgress" id="loading">
        Joining room...
    </div>
    <div v-else>
        <div class="join-input">
            <InputField
                ref="inputRoomCode"
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
