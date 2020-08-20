import axios from 'axios'
import { BAEIS_URL } from './url';

// 请求列表
const requestList = []
// 取消列表
const CancelToken = axios.CancelToken
let sources = {}

// axios.defaults.timeout = 10000
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
axios.defaults.baseURL = BAEIS_URL
axios.defaults.headers.post['Cache-Control'] = 'no-cache'
/**
 * 添加请求拦截器
 */
axios.interceptors.request.use((config) => {
    const request = JSON.stringify(config.url) + JSON.stringify(config.params) + JSON.stringify(config.data)
    config.cancelToken = new CancelToken((cancel) => {
        sources[request] = cancel
    })
    if(requestList.includes(request)){
        sources[request]('取消重复请求')
    }else{
        requestList.push(request)
    }
    const token = ''
    if (token && token != '') {
        config.headers.Token = token;
    }
    return config
}, function (error) {
    return Promise.reject(error)
})
/**
 * 添加响应拦截器
 */
axios.interceptors.response.use(function (response) {
    // 对响应数据做些事
    const request = JSON.stringify(response.config.url) + JSON.stringify(response.config.data)
    requestList.splice(requestList.findIndex(item => item === request), 1)
    // 验证签名失败后退出
    if (response.data.status === 900401 || response.data.status === 900402) {

    }
    return response
}, function (error) {
    if (axios.isCancel(error)) {
        requestList.length = 0
        throw new axios.Cancel('cancel request')
    } else {
        // 服务器报错 同样将请求移除请求队列
        // const request = JSON.stringify(error.response.config.url) + JSON.stringify(error.response.config.data)
        // requestList.splice(requestList.findIndex(item => item === request), 1)
        // window.ELEMENT.Message.error('网络请求失败', 1000)
    }
    return Promise.reject(error)
})

const request = function (url, params, config, method) {
    return new Promise((resolve, reject) => {
        axios[method](url, params, Object.assign({}, config)).then(response => {
            if (response.data.status == 1) {
                resolve(response.data)
            } else {
                reject(response.data);
            }
        }, err => {
            if (err.Cancel) {
                console.log(err)
            } else {
                reject(err)
            }
        }).catch(err => {
            reject(err)
        })
    })
}

const post = (url, params, config = {}) => {
    return request(url, params, config, 'post')
}

const get = (url, params, config = {}) => {
    return request(url, params, config, 'get')
}

export {sources, post, get}
