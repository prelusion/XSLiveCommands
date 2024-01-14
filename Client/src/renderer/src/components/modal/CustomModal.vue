<template>
    <div class="modal-overlay" v-if="visible" @click.self="close">
        <div class="modal-content">
            <slot></slot> <!-- Custom content -->
        </div>
    </div>
</template>
<script>
import {defineComponent} from "vue";

export default defineComponent({
    name: "CustomModal",
    data() {
        return {
            visible: false,
        };
    },
    methods: {
        open() {
            this.visible = true;
        },
        close() {
            this.visible = false;
        }
    }
});
</script>


<style>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    padding: 20px;
    background: white;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    min-width: 300px;
    z-index: 1001;
    cursor: default;
}
</style>