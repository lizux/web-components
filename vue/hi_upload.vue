<!--
// 示例：
<hi-upload :file-list="files" :disabled="uploading" :limit="1" accept=".jpg,.png" :on-remove="handleFileChange" :on-change="handleFileChange">
    <p>点击或将文件拖拽到此区域上传</p>
</hi-upload>

data: function() {
        return {
            files: [],
            uploading: false
        }

methods: {
    handleFileChange(file, files) {}
}
-->

<template>
    <div class="file-wrap">
        <div :class="['file-box', {'is-active': isDragActive}]" @click="onClick" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
            <input type="file" ref="_fileInput" multiple :accept="accept" :disabled="disabled" class="file-input" @change="onDrop" />
            <slot>
                <i class="icon-upload"></i>
                <div>Select or Drop Your File Here</div>
            </slot>
        </div>
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
    width: 100%;
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
.file-box .icon-upload {
    display: block;
    width: 40px;
    height: 40px;
    margin: 10px auto;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cpath d='M1 14.5a6.496 6.496 0 0 1 3.064-5.519 8.001 8.001 0 0 1 15.872 0 6.5 6.5 0 0 1-2.936 12L7 21c-3.356-.274-6-3.078-6-6.5zm15.848 4.487a4.5 4.5 0 0 0 2.03-8.309l-.807-.503-.12-.942a6.001 6.001 0 0 0-11.903 0l-.12.942-.805.503a4.5 4.5 0 0 0 2.029 8.309l.173.013h9.35l.173-.013zM13 13v4h-2v-4H8l4-5 4 5h-3z'/%3E%3C/svg%3E")
        no-repeat center/100%;
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
    width: 2em;
    height: 2em;
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
    font-size: 2em;
}
.file-list:hover .action {
    display: block;
}
.file-input {
    display: none;
}
</style>
