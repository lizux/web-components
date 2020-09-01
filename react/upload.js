/* Example:
<Upload ref={(c) => this._uploader = c} style={styles.upload} boxW={120} imgW={100} imgH={100} fileType={'image'} checkType={this.checkType} limit={3} setValid={this.handleValid} oneClick={true} progress={true} fileName={'uploadFile'} updateName={handleFileName}>
    <div>点击或将文件拖拽到此区域上传</div>
</Upload>
<Btn label="Upload" onClick={this.upload}/>

upload() {
    let url = 'api/upload';
    const callback = (result) => {
        this.setState({loading: false});
    };
    const fallback = () => {
        this.setState({loading: false});
    };
    this._uploader.upload(url, null, callback, fallback);
}
handleValid(valid) {
    if (!valid) {
        alert('文件数量不满足限定条件');
    }
}
checkType() {
    alert('文件格式不符合要求，请上传正确文件');
}
handleFileName(name) {
    alert(待上传文件：' + name);
}
*/

import React from 'react';
import request from 'axios';

import './upload.css';
let styles = {
    wrap: {
        display: 'table-cell',
        border: '1px dashed #ccc',
        textAlign: 'center',
        verticalAlign: 'middle'
    },
    box: {
        display: 'inline-block',
        position: 'relative',
        margin: '0 3px',
        cursor: 'pointer'
    },
    pic: {
        overflow: 'hidden',
        textAlign: 'center'
    },
    img: {
        verticalAlign: 'middle'
    },
    after: {
        display: 'inline-block',
        width: 0,
        height: '100%',
        verticalAlign: 'middle'
    },
    text: {
        overflow: 'hidden',
        height: '1.6em',
        fontSize: 12,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    close: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, .5)',
        color: '#fff',
        fontSize: 30,
        lineHeight: '35px',
        transform: 'translate(-50%, -50%)'
    },
    progress: {
        width: '100%'
    },
    file: {
        display: 'none'
    }
};
const fileicon = 'data:img/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAACMCAYAAACuwEE+AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjAzNDdDODc5OTRFMDExRTY5NUVDREY5RkMxQ0FBRjE0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjAzNDdDODdBOTRFMDExRTY5NUVDREY5RkMxQ0FBRjE0Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MDM0N0M4Nzc5NEUwMTFFNjk1RUNERjlGQzFDQUFGMTQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MDM0N0M4Nzg5NEUwMTFFNjk1RUNERjlGQzFDQUFGMTQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz78wAAGAAAFKklEQVR42uzcT2gcVRzA8d/bP9lk828b0yZpSBZpaUiludhCTRD/IEpq1dqC5FCKFzUeFCR48KQVoQep4MlaL6UohAqK1aYX8c/BKjQKCm1RKhLDpmlMrMmG/Nsm474xu+4mu8ksO9ud3fl+IYdkN9O08+l7b95MqwzDECKrKcCQK8E8/P4VI2oEOKOrVXiVdLcH5e3HWhRg1rT/zSFjqa5VvJXVSFlTfaVXvnz2btvQeMoBS3RhCRlZml5YlpcujBmAAYvlfhidE9eDAUtx8pQLFqUUZxMwuYwsgAEM0xBgwAIYsACmBLGwhAEMIwtgwAIYsAAGLFQKYPLCwk6vu8DkP7IAxjVgmIYAAxbAgIVEfMX6hfe+8YUxv3SbM8AIUxwsPA9TpmAKN7IApuzAMA0BBiyAAQsVEQxYAONMLFwllTYYRhbAOBiLEuXxcDZLEUwxRhZvsD5uBjAlB6Yo05DHJxWhJs5kqYEpFpbKrWFRPj9ncoOMlWXbjuUrSSzx6UdPQ3pkUV4fIjbpdnTKOWD6z0cM1dQhQS6DXVHeYAxOPmsYIsAQYAgwVIiFak0DYCiHC1Ibtx4AQ4AhwBBgCDAEGCLAEGAIMAQYAgwBhggwBBgCDAGGAEOAIQIMAYYAQ4AhwBABhgBDgCHAEGAIMESAIcAQYAgwBBgCDBFgCDAEGAIMAYYAQwQYAgwBhgBDgCECDAGGAEOAIcAQYIgAQ4AhwBBgCDAEGCLAkI35nP4DPt9VL891b7XlWN/8NiOvfjWR/Lwz5Je3Hm2W9obAutd0B8JBOd67PeOx9p26zgjjtp65p97EontwV530ddQwhACGXDUlnf5l2vzINEUM/jglJy/f2vD7B/Ztkb5778r42rkr09LVWpWckgZ/nU17fWhkToZWp56NpifAuKRr/8TkyLlRhg2mJAIMAYZYwzguvSheuzC+eDQsjTX+de89NjhirmvsSi+UO7cF1i26h0dm5frk4qYLdsC4JL0h+NoD26SzpSrj63vDNebHk3u2yEfDU8mrQKYkF9bdHJBTh9uyYkktWOExd7Hf621mhLkT6aE+2x6L7oNLf2X829v74UhyyrBzb0WPLCcOtJoQUqefz6/OmHs6ifTe0CMddclpUY82r/c0yvHvJhlh3JSehlKxaLAvXhxPw5JYV2m0127MJ792cE/IBAwYF01FqdOQ3jnebG1y7LOI/Pn3YvLzJ3bXMSUVMiu3Bu5U97Wljw6fXrW2kP3451sy8NB/a5jdLUHAuKXm2vTL9HcPteV8DD2d6ZHq0vgiU1K511Trt+U4oYCXEcYN3YzG0tYwj5/5QyYWlsvu98kIY1Pj0fQd4kO7yvNhLMDY1Pej6ZfOT3eFLH2f3rvRtyr03gxgXJReqKbuq+hNubNPtW6K5Z2D28336g3Iy/07za8BxiWd+HZC5pZW/gcRX9NkGj00Cr2ze7Yv/Sao3iaw8+ZnIVKGYeR1gBfOR4yfxuYL9gNa/VcDmZ76z1a2u9WJ9EihN9Ws3DpIvDeRvixee3vASoXeU4qPXooRxqFTU/8no+Y9JCtNzsbk5NfjJfOoA5fVBUhPK/oekh5t9A5w6o3G1BElMhNb9+C503P8lERMSVTCAYYAQ4AhwJArwXgVf4iAyaEdq/9dBjn4JCsHgRnoaVR+D8OMk7s/XG3bsfLeuEu0//TvxvKKwdlxWA1VXjlzuE1aan3KUWB0L18YM4Yj8xIDTtGriC8ue9qr5ZXuRtuw2A6Gyj/AUE79K8AAQhL09QRqyxkAAAAASUVORK5CYII=';

export default class FileUpload extends React.Component {
    constructor(props) {
        super();
        let type = props.fileType;
        this.state = {
            accept: type
                ? (type === 'image'
                    ? 'image/*'
                    : '.' + type)
                : '*',
            loading: false,
            percent: 0,
            isDragActive: false,
            files: [],
            names: [],
            thumbnails: []
        };
        this.count = 0;
        this.onDragOver = this.onDragOver.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.onClick = this.onClick.bind(this);
        this.upload = this.upload.bind(this);
        Object.assign(styles.wrap, {
            width: props.boxW,
            height: props.imgH + 25
        });
        Object.assign(styles.box, {
            width: props.imgW,
            height: props.imgH
        });
        Object.assign(styles.pic, {height: props.imgH});
        Object.assign(styles.img, {maxHeight: props.imgH});
        if (props.oneClick) {
            styles.wrap = {
                border: 0
            };
        }
    }
    onDragOver(evt) {
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
        this.setState({isDragActive: true});
    }
    onDragLeave() {
        this.setState({isDragActive: false});
    }
    onDrop(evt) {
        evt.preventDefault();
        this.setState({isDragActive: false});
        let files = [];
        if (evt.dataTransfer) {
            files = evt.dataTransfer.files;
        } else if (evt.target) {
            files = evt.target.files;
        }

        const {
            limit,
            oneClick,
            setValid,
            fileType,
            checkType,
            updateName
        } = this.props;
        if (limit && this.state.files.length >= limit) {
            return;
        }
        let fileArr = [].slice.call(files);
        fileArr.forEach((item) => {
            const imgs = ['gif', 'jpg', 'jpeg', 'png'];
            let checkimg = imgs.indexOf(item.type.split('/').pop()) > -1;
            let check = true;
            if (fileType) {
                if (fileType === 'image') {
                    check = checkimg;
                } else {
                    check = item.name.split('.').pop().toLowerCase() === fileType;
                }
            }
            if (check) {
                if (limit && this.count >= limit) {
                    return;
                }
                this.count++;
                let reader = new FileReader();
                reader.onloadend = (evt) => {
                    this.setState({
                        files: [
                            ...this.state.files,
                            item
                        ],
                        names: [
                            ...this.state.names,
                            item.name
                        ],
                        thumbnails: [
                            ...this.state.thumbnails, {
                                url: checkimg
                                    ? evt.target.result
                                    : fileicon,
                                name: item.name
                            }
                        ]
                    }, () => {
                        if (this.state.files.length >= this.count) {
                            updateName && updateName(this.state.names);
                            if (this.state.files.length > 0 && (!limit || (limit && this.state.files.length === limit))) {
                                setValid && setValid(true);
                            }
                            oneClick && oneClick();
                        }
                    });
                };
                reader.readAsDataURL(item);
            } else {
                // 延时触发以避免阻塞正确类型文件操作
                window.setTimeout(() => {
                    checkType && checkType(item.name);
                }, 10);
            }
        });
    }
    onClick() {
        // Chrome don't allow upload same file twice bug
        this._fileInput.value = '';
        this._fileInput.click();
    }
    remove(index, evt) {
        const {limit, setValid, updateName} = this.props;
        evt.preventDefault();
        evt.stopPropagation();
        this.state.files.splice(index, 1);
        this.state.names.splice(index, 1);
        this.state.thumbnails.splice(index, 1);
        this.setState({
            files: this.state.files,
            names: this.state.names,
            thumbnails: this.state.thumbnails
        }, () => {
            updateName && updateName(this.state.names);
            if (this.state.files.length < 1 || (limit && this.state.files.length !== limit)) {
                setValid && setValid(false);
            }
        });
        this.count--;
    }
    clear() {
        this.count = 0;
        this.setState({files: [], names: [], thumbnails: []});
    }
    upload(url, param, callback, fallback) {
        let fileBlob = this.state.files;
        const {limit, progress} = this.props;
        if (fileBlob.length < 1) {
            alert('Please select file!');
            fallback && fallback();
            return;
        } else if (limit && fileBlob.length !== limit) {
            alert('Please upload ' + limit + ' files! Now is ' + fileBlob.length);
            fallback && fallback();
            return;
        }
        const data = new FormData();
        data.append('data', JSON.stringify(param));
        fileBlob.forEach((value) => {
            data.append(this.props.fileName || value.name, value);
        });
        let config = {
            onUploadProgress: (evt) => {
                let percent = Math.floor(evt.loaded / evt.total * 100);
                if (progress) {
                    if (typeof progress === 'function') {
                        progress(percent);
                    }
                } else {
                    this.setState({percent: percent});
                }
            },
            transformRequest: [data => data]
        };
        this.setState({loading: true});
        request.post(url, data, config).then((response) => {
            this.setState({loading: false});
            let result = response.data;
            if (result && result.meta) {
                if (result.meta.code === 200) {
                    callback && callback(result.data);
                    this.clear();
                } else {
                    console.error(result.meta.errmsg || result.meta.error_message);
                    fallback && fallback(result.meta);
                }
            }
        }, (error) => {
            this.setState({loading: false});
            fallback && fallback(error);
        });
    }
    render() {
        let {thumbnails} = this.state;
        let wrap = Object.assign({}, styles.wrap, {
            background: this.state.isDragActive
                ? '#f3f3f3'
                : 'transparent',
            borderStyle: this.state.isDragActive
                ? 'solid'
                : 'dashed'
        });
        return (
            <div style={this.props.style}>
                <div style={wrap} onClick={this.onClick} onDragLeave={this.onDragLeave} onDragOver={this.onDragOver} onDrop={this.onDrop}>
                    <input type="file" ref={(c) => this._fileInput = c} multiple accept={this.state.accept} style={styles.file} onChange={this.onDrop}/>
                    {(() => {
                        if (!this.props.oneClick && thumbnails.length > 0) {
                            return thumbnails.map((item, i) => (
                                <div key={i} className="hoverRemove" style={styles.box} title={item.name} onClick={this.remove.bind(this, i)}>
                                    <div style={styles.pic}>
                                        <img src={item.url} style={styles.img}/>
                                        <div style={styles.after}></div>
                                    </div>
                                    <a style={styles.close} title="remove">&times;</a>
                                    <div style={styles.text}>{item.name}</div>
                                </div>
                            ));
                        } else {
                            return this.props.children;
                        }
                    })()}
                </div>
                {this.state.loading && !this.props.progress
                    ? <progress value={this.state.percent} max="100" className="upload" style={styles.progress}></progress>
                    : null}
            </div>
        );
    }
}
FileUpload.defaultProps = {
    imgW: 60,
    imgH: 60
};
