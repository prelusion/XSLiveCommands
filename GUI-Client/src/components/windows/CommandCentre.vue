<template>
    <Buttons :buttonConfig="buttonConfig"></Buttons>
</template>

<script lang="ts">
import {GameHandler} from "@/classes/game-handler";
import {SocketHandler} from "@/classes/socket-handler";
import Buttons from "@/components/Buttons.vue";
import {ensure} from "@/util/general";
import {defineComponent} from "vue";

export default defineComponent({
    name: "CommandCentre",
    components: {Buttons},
    props: {},
    data() {
        return {
            commandName: "",
            id: -1,
            args: [] as Array<string>,
            buttonConfig: [
                {
                    window: "Main",
                    text: "Disconnect",
                    callback: async () => {
                        await SocketHandler.instance.leaveRoom();
                        await GameHandler.instance.resetState(ensure(SocketHandler.instance.room?.scenario));
                    },
                },
                {
                    text: "Send",
                    callback: () => {
                        this.sendCommand();
                    },
                },
            ] as Array<ButtonConfig>,
        };
    },
    mounted() {
        console.log(SocketHandler.instance.room?.commands);
    },
    computed: {},
    methods: {
        sendCommand(): void {

        },
    },
    watch: {},
});

</script>

<style scoped lang="scss">
button {
    padding: 5px;
}

input {
    padding: 4px;
}
</style>
