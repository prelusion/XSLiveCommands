<template>
    <div class="password-container">
        <label for="password">Tyranny Launch Code</label>
        <input id="password" class="password-input" type="password" v-model="password" placeholder="Launch Code..."/>
        <div class="input-container">
            <button class="submit-button" @click="submit">Begin Tyranny!</button>
            <button class="submit-button" @click="close()">Abort Mission</button>
        </div>
        <div id="error-msg" v-if="errorMsg" v-html="errorMsg"></div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Buttons from "../../Buttons.vue";
import {assert} from "../../../../../shared/src/util/general";
import {SocketHandler} from "../../../classes/socket-handler";
import {ButtonConfig} from "../../../interfaces/buttons";

export default defineComponent({
    name: "Password",
    components: {Buttons},
    props: {
        errorMsg: {
            type: String,
        }
    },
    data() {
        return {
            password: '',


            buttonConfig: [
                {
                    text: "Begin Tyranny",
                    callback: async () => {
                        assert(SocketHandler.instance.room);
                        if (this.password) {
                            this.requestForTyrant(this.password)
                        }

                        this.showPasswordModal();
                    },
                },
                {
                    text: "Begin Tyranny",
                    callback: async () => {
                        assert(SocketHandler.instance.room);
                        if (this.password) {
                            this.requestForTyrant(this.password)
                        }

                        this.showPasswordModal();
                    },
                }
            ] as Array<ButtonConfig>,
        };
    },
    methods: {
        submit() {
            this.$emit('submit', this.password);
        },
        close() {
            this.$emit('closeModal');
        }
    }
});
</script>


<style>
.password-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.input-container {
    display: flex;
    flex-direction: row;
    gap: 10px;
}

.password-input {
    padding: 6px;
    border: 1px solid #111;
    width: 100%;
    box-sizing: border-box;
    font-size: 16px;
}

.submit-button {
    padding: 6px 20px;
    background-color: #ddd;
    border: 1px solid #111;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

.submit-button:hover {
    background-color: #999;
    border-radius: 0;
}

#error-msg {
    margin-top: 3px;
    color: red;
}

</style>