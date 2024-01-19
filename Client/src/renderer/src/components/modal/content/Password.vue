<template>
    <div class="password-container">

        <InputField
            :label="'Tyranny Launch Code'"
            :type="password"
            :placeholder="'Launch Code...'"
            :rules="['max:30']"
            :errorMsg="[errorMsg]"
            @updateValue="password = $event"
            @validationStatus="validationStatus = $event"
        />
        <div class="input-container">
            <button class="submit-button" @click="submit">Begin Tyranny!</button>
            <button class="submit-button" @click="close()">Abort Mission</button>
        </div>


    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import InputField from "../../formComponents/InputField.vue";

export default defineComponent({
    name: "Password",
    components: {InputField},
    props: {
        errorMsg: {
            type: String,
        }
    },
    data() {
        return {
            password: '',
            validationStatus: true
        };
    },
    methods: {
        submit() {
            console.log(this.validationStatus)
            if (this.validationStatus) {
                this.$emit('submit', this.password);
            }
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