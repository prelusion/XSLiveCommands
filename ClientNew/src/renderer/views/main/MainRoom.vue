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

<script lang="ts">
import Buttons from "../../components/Buttons.vue";
import {defineComponent} from "vue";
import {changeTitle} from "../../util/general";
import {ButtonConfig} from "../../types/buttons";
import {UserServerAction} from "@renderer/util/user-server-action";

export default defineComponent({
    name: "MainRoom",
    components: {Buttons},
    props: {},
    data() {
        return {
            steamId: '',
            steamName: '',
            buttonConfig: [
                {
                    window: "Join",
                    text: "Join a Room",
                },
                {
                    window: "Create",
                    text: "Create a Room",
                },
            ] as Array<ButtonConfig>,
            message: "",
        };
    },
    mounted: function () {
        changeTitle('');
        window.manager.resize(900, 600);

        const message = this.$router.currentRoute.value.params?.message as string;

        if (message) {
            this.message = message;
        }

        this.steamId = UserServerAction.platform!.userId;
        this.steamName = UserServerAction.username!;
    },
    computed: {},
    methods: {},
    watch: {},
});

</script>

<style scoped lang="scss">
.main-wrapper {
    position: relative;

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
