<script setup lang="ts">
import Buttons from "../../components/Buttons.vue";
import {defineComponent, onMounted, ref} from "vue";
import {changeTitle} from "../../util/general";
import {ButtonConfig} from "../../types/buttons";
import {UserServerAction} from "@renderer/util/user-server-action";
import {Route} from "@renderer/router/routes";
import {assert} from "../../../shared/src/util/general";
import {useRouter} from "vue-router";

const router = useRouter();

const steamId = ref('')
const steamName = ref('')
const message = ref('');

onMounted(() => {
    assert(UserServerAction.platform);
    assert(UserServerAction.username);

    changeTitle('');

    const queryMessage = router.currentRoute.value.query?.message as string;
    if (queryMessage) {
        message.value = queryMessage;
    }

    steamId.value = UserServerAction.platform.userId;
    steamName.value = UserServerAction.username;
});

const buttonConfig = [
    {
        route: Route.JOIN,
        text: "Join a Room",
    },
    {
        route: Route.CREATE,
        text: "Create a Room",
    },
] as Array<ButtonConfig>
</script>

<template>
    <div class="main-wrapper">
        <div class="">
            Name: {{ steamName }}
        </div>
        <div class="">
            Steam ID: {{ steamId }}
        </div>
        <div id="displayMessage">
            {{ message }}
        </div>
        <div id="centered">
            <div class="buttons-wrapper">
                <Buttons
                    direction="column"
                    position="relative"
                    :styles="{ alignItems: 'center' }"
                    :buttonConfig="buttonConfig"
                ></Buttons>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.main-wrapper {
    position: relative;
    padding: 20px;

    #displayMessage {
        margin-top: 8vh;
        text-align: center;
        color: #ce3d3d;
    }

    #version {
        position: absolute;
        top: 0;
        right: 0;
    }

    #centered {
        margin-top: 150px;
    }
}
</style>
