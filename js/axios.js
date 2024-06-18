import {reactive, toRefs} from 'vue';
import axios from 'axios';
import {apiDefinition} from '../api/api';

function ajax(state, originOption) {
    state.error = false;
    state.loading = true;

    let {url, method = 'get', data} = originOption;
    let options = {
        url,
        method,
        headers: {}
    };
    if (data.header) {
        Object.keys(data.header).forEach((key) => {
            options.headers[key] = data.header[key];
        });
    }
    if (data.param) {
        if (data.payload) {
            options.data = data.param;
        } else {
            options.headers['Content-Type'] = 'application/json;charset=UTF-8';
            if (method !== 'get') {
                options.data = data.param;
            } else {
                options.params = data.param;
            }
        }
    }

    return axios(options)
        .then((response) => {
            let result = response.data;
            if (result.error) {
                return Promise.reject(result.error);
            }
            let realResult = data.resultKey ? result[data.resultKey] : result;
            state.data = realResult;
            return Promise.resolve(realResult);
        })
        .catch((error) => {
            let err = error;
            if (error.response) {
                err = error.response.data;
            }
            state.error = err;
            return Promise.reject(err);
        })
        .finally(() => {
            state.loading = false;
        });
}

export default function useRequest(type) {
    let apiInstance = apiDefinition[type];
    let {init, resultKey, method, url, handleData} = apiInstance;
    let state = reactive({
        data: init,
        loading: false,
        error: false
    });
    let controller = new AbortController();
    let request = function (data) {
        let realUrl = '';
        if (typeof url === 'string') {
            realUrl = url;
        } else if (typeof url === 'function') {
            realUrl = url(data);
        }
        if (!realUrl.startsWith('http')) {
            realUrl = apiDefinition.rootApiUrl + realUrl;
        }
        let realData = data;
        if (handleData && typeof handleData === 'function') {
            realData = handleData(data);
        }
        return ajax(state, {
            url: realUrl,
            method,
            instance: controller,
            data: {
                ...realData,
                resultKey
            }
        });
    };
    request.cancel = () => {
        controller.abort();
    };

    return {
        request,
        ...toRefs(state)
    };
}

function getPercent(arr) {
    let child = arr.reduce((total, next) => {
        return total + next;
    });
    return Math.floor(child / arr.length);
}

export function handleSplit(apiUpload, file, md5, uploadPercent, callback, fallback) {
    console.log(123, uploadPercent);
    let param = {};
    let blockSize = 1024 * 1024 * 10;
    let blockNum = Math.ceil(file.size / blockSize);
    let requestNum = 0;
    let totalProcess = [];

    for (let index = 0; index < blockNum; index++) {
        let start = index * blockSize;
        let end = Math.min(file.size, start + blockSize);
        param.file_name = file.name;
        param.file_md5 = md5;
        param.chunk_id = index + 1;
        param.chunks = blockNum;

        let config = {
            timeout: 6000000,
            onUploadProgress: (evt) => {
                totalProcess[index] = Math.floor((evt.loaded / evt.total) * 100);
                uploadPercent.loadTotal = getPercent(totalProcess);
                console.log(140, index);
                // console.log(141, evt.loaded);
                console.log(142, uploadPercent.loadTotal);
            }
        };
        setTimeout(() => {
            apiUpload({file: file.slice(start, end), param}, config)
                .then(() => {
                    requestNum++;
                    if (requestNum >= blockNum) {
                        callback && callback();
                    }
                })
                .catch(() => {
                    requestNum++;
                    if (requestNum >= blockNum) {
                        fallback && fallback();
                    }
                });
        }, 500 * index);
    }
}
