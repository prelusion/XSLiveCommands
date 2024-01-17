<template>
    <div class="password-container">
        <label for="password">Tyranny Launch Code</label>
        <input id="password" class="password-input" type="password" v-model="password" placeholder="Launch Code..."/>
        <div class="input-container">
            <button class="submit-button" @click="submit">Begin Tyranny!</button>
            <button class="submit-button" @click="($parent as CustomModal).close()">Abort Mission</button>
        </div>
        <div id="error-msg" v-if="errorMsg" v-html="errorMsg"></div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import CustomModal from "../CustomModal.vue";

export default defineComponent({
    name: "Password",
    computed: {
        CustomModal() {
            return CustomModal
        }
    },
    components: {},
    props: {
        errorMsg: {
            type: String,
        }
    },
    data() {
        return {
            password: '',
        };
    },
    methods: {
        submit() {
            this.$emit('submit', this.password);
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
    border-radius: 2px;
}

.submit-button {
    padding: 6px 20px;
    background-color: #eee;
    border: 1px solid #111;
    font-size: 16px;
    transition: background-color 0.3s;
    border-radius: 2px;
}

.submit-button:hover {
    background-color: #ddd;
    border-radius: 0;
}

#error-msg {
    margin-top: 3px;
    color: red;
}

</style>