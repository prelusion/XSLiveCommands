<template>
    <div class="modal-overlay" v-if="visible" @click.self="attemptClose">
        <div class="modal-content">
            <slot @closeModal="close"></slot> <!-- Custom content -->
        </div>
    </div>
</template>
<script>
import {defineComponent} from "vue";

export default defineComponent({
    name: "CustomModal",
    props: {
        outsideClickClose: {
            type: Boolean,
            default: true,
        }
    },
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
        },
        attemptClose() {
            if (this.outsideClickClose) {
                this.close();
            }
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
    border: 1px solid #777;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    min-width: 300px;
    z-index: 1001;
    cursor: default;
}
</style>