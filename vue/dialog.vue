  <template>
    <transition name="modal">
        <div class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-container">
                    <div class="modal-header">
                        <slot name="header">Modal</slot>
                    </div>
                    <div class="modal-body">
                        <slot name="body"></slot>
                    </div>
                    <div class="modal-footer">
                        <slot name="footer">
                            <button class="modal-button modal-default-button" @click="$emit('submit')">OK</button>
                            <button class="modal-button modal-info-button" @click="$emit('close')">Close</button>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'MoDialog',
    data() {
        return {
            isShow: false
        };
    }
};
</script>

<style lang="less" scoped>
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: table;
    transition: opacity 0.3s ease;
}

.modal-wrapper {
    display: table-cell;
    vertical-align: middle;
}

.modal-container {
    width: 600px;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;
}

.modal-header h3 {
    margin-top: 0;
    color: #42b983;
}

.modal-body {
    margin: 20px 0;
}
.modal-footer {
    text-align: right;
}
.modal-button {
    margin-left: 6px;
    padding: 6px 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
}
.modal-default-button {
    border-color: #b3d8ff;
    background-color: #ecf5ff;
    color: #409eff;
}
.modal-info-button {
    border-color: #d3d4d5;
    background-color: #f4f4f5;
    color: #999;
}

.modal-enter {
    opacity: 0;
}

.modal-leave-active {
    opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
}
</style>
