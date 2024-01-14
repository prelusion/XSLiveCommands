<template>
    <div class="password-container">
        <label for="password">Room password:</label>
        <div class="input-container">
            <input id="password" class="password-input" type="password" v-model="password" placeholder="Password:..."/>
            <button class="submit-button" @click="submit">Lets Tyrant</button>
        </div>
        <div id="error-msg" v-if="errorMsg" v-html="errorMsg"></div>
    </div>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
    name: "Password",
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
    border-radius: 5px;
    width: 100%;
    box-sizing: border-box;
    font-size: 16px;
}

.submit-button {
    padding: 6px 20px;
    background-color: #ddd;
    border: 1px solid #111;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

.submit-button:hover {
    background-color: #999;
}

#error-msg {
    margin-top: 3px;
    color: red;
}

</style>