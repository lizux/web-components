<!--
// 示例：
<hi-upload :file-list="files" :disabled="uploading" :limit="1" accept=".jpg,.png" :on-remove="handleFileChange" :on-change="handleFileChange">
    <i class="el-icon-upload"></i>
    <div>Select or Drop Your File Here</div>
    <div slot="tip">
        <p class="upload-tip">请按当前页面的 App 信息进行包文件的上传和检测</p>
    </div>
</hi-upload>
-->

<template>
    <div class="file-wrap">
        <div :class="['file-box', {'is-active': isDragActive}]" @click="onClick" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
            <input type="file" ref="_fileInput" multiple :accept="accept" :disabled="disabled" class="file-input" @change="onDrop" />
            <slot></slot>
        </div>
        <slot name="tip"></slot>
        <div v-for="(item, index) in allFiles" :key="item.uid" class="file-list" :title="item.name" @click.prevent="removeFile(index)">
            <div class="file">
                <img v-if="item.url" :src="item.url" class="icon" @load="onLoad($event)" />
                <i v-else class="el-icon-document"></i>
                <span class="text">{{item.name}}</span>
            </div>
            <a class="action" title="removeFile">&times;</a>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            count: 0,
            allFiles: [...this.fileList],
            isDragActive: false
        };
    },
    props: {
        fileList: {
            type: Array
        },
        disabled: {
            type: Boolean
        },
        limit: {
            type: Number,
            default: 0
        },
        accept: {
            type: String,
            default: ''
        },
        onRemove: {
            type: Function
        },
        onChange: {
            type: Function
        }
    },
    computed: {
        fileType: function() {
            if (!this.accept) {
                return [];
            }
            return this.accept.split(',').map(item => {
                return item ? item.split('.')[1] : '';
            });
        }
    },
    watch: {
        fileList: function(newValue) {
            this.allFiles = [...newValue];
        }
    },
    methods: {
        onDragOver(evt) {
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy';
            if (!this.disabled) {
                this.isDragActive = true;
            }
        },
        onDragLeave() {
            this.isDragActive = false;
        },
        onDrop(evt) {
            evt.preventDefault();
            if (this.disabled) {
                return;
            }
            this.isDragActive = false;
            let files = [];
            if (evt.dataTransfer) {
                files = evt.dataTransfer.files;
            } else if (evt.target) {
                files = evt.target.files;
            }

            if (this.limit && this.allFiles.length >= this.limit) {
                return;
            }
            let fileArr = [].slice.call(files);
            fileArr.forEach(item => {
                let valid = true;
                if (this.fileType.length) {
                    let name = item.name
                        .split('.')
                        .pop()
                        .toLowerCase();
                    if (!this.fileType.includes(name)) {
                        valid = false;
                    }
                }
                if (valid) {
                    if (this.limit && this.count >= this.limit) {
                        return;
                    }
                    this.count++;
                    let reader = new FileReader();
                    reader.onloadend = () => {
                        let preview = '';
                        if (this.checkImage(item)) {
                            // 使用该方法时，记得释放内存 revokeObjectURL
                            preview = window.URL.createObjectURL(item);
                            // 当使用 readAsDataURL 时以下方法也可以实现预览
                            // preview = reader.result;
                        }
                        this.allFiles.push({
                            name: item.name,
                            uid: item.uid,
                            size: item.size,
                            url: preview,
                            status: 'ready',
                            percentage: 0,
                            raw: item
                        });
                        this.onChange(item, this.allFiles);
                    };
                    reader.readAsArrayBuffer(item);
                }
            });
        },
        onClick() {
            // Chrome don't allow upload same file twice bug
            this.$refs._fileInput.value = '';
            this.$refs._fileInput.click();
        },
        removeFile(index) {
            let obj = this.allFiles.splice(index, 1);
            this.count--;
            this.onRemove(obj[0], this.allFiles);
        },
        clearFiles() {
            this.allFiles = [];
            this.count = 0;
        },
        onLoad(evt) {
            window.URL.revokeObjectURL(evt.target.src);
        },
        checkImage(file) {
            const imgs = ['gif', 'jpg', 'jpeg', 'png', 'svg', 'bmp'];
            return imgs.includes(file.type.split('/').pop());
        }
    }
};
</script>

<style lang="less" scoped>
.file-box {
    display: inline-block;
    width: 360px;
    height: 100px;
    border: 1px dashed #ccc;
    text-align: center;
    cursor: pointer;
}
.file-box:hover {
    border-color: #409eff;
}
.file-box.is-active {
    border: 2px dashed #409eff;
    background: rgba(32, 159, 255, 0.06);
}
.file-box .el-icon-upload {
    margin: 0 0 8px;
    color: #c0c4cc;
    font-size: 66px;
}
.file-list {
    position: relative;
    margin: 0 3px 6px;
    text-align: left;
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
.file-list:hover {
    background-color: #f5f7fa;
}
.file-list .file {
    padding: 3px;
    color: #666;
    line-height: 20px;
}
.file-list .icon {
    vertical-align: middle;
}
.file-list .text {
    overflow: hidden;
    height: 1.6em;
    font-size: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.file-list .action {
    display: none;
    position: absolute;
    top: 0;
    right: 5px;
    font-size: 20px;
}
.file-list:hover .action {
    display: block;
}
.file-input {
    display: none;
}
</style>
