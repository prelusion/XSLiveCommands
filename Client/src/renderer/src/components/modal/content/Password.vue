<template>
    <div class="password-container">

        <InputField
            ref="input-1"
            name="Tyranny Launch Code"
            placeholder="Launch Code"
            :type="password"
            :rules="['max:30']"
            :errorMsg="[errorMsg]"
            @onValueUpdated="password = $event"
        />

        <div class="input-container">
            <button class="submit-button" @click="submit">Begin Tyranny!</button>
            <button class="submit-button" @click="($parent as CustomModal).close()">Abort Mission</button>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import CustomModal from "../CustomModal.vue";
import InputField from "../../forms/InputField.vue";
import HasInputFields from "../../../mixins/HasInputFields";

export default defineComponent({
    name: "Password",
    mixins: [HasInputFields],
    computed: {
        CustomModal() {
            return CustomModal
        }
    },
    components: {InputField},
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
            if (this.validateInputs()) {
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