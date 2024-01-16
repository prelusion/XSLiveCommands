<template>
    <button @click="emitDisconnect" class="disconnect-button">
        <svg viewBox="0 0 24 24" class="icon">
            <path
                d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M17,14V16H12V18L8,15L12,12V14H17Z"/>
        </svg>
    </button>
</template>

<script>
export default {
    name: 'DisconnectButton',
    methods: {
        emitDisconnect() {
            this.$emit('disconnect');
        }
    }
};
</script>

<style scoped>
.disconnect-button {
    position: absolute;
    margin: 10px;
    top: 0;
    right: 0;
    background-color: rgb(200, 0, 0);
    border: none;
    padding: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
}

.disconnect-button:hover {
    background-color: darkred;
}

.icon {
    fill: white;
    width: 24px;
    height: 24px;
}
</style>