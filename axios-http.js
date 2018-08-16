import axios from 'axios'
import qs from 'qs'
axios.defaults.retry = 4;
axios.defaults.retryDelay = 1000;
axios.defaults.timeout = 5000;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
axios.defaults.baseURL = '';
//POST传参序列化
axios.interceptors.request.use((config) => {
  if(config.method  === 'post'&& config.data!==undefined && config.data.constructor !== FormData){
    if(Object.prototype.toString.call(config.data) === '[object Object]'){
      config.data = qs.stringify(config.data)
    };
  }
  return config;
},(error) =>{
   //console.log("错误的传参");
  return Promise.reject(error);
});
//code状态码200判断
axios.interceptors.response.use((res) =>{
  if(res.status != '200'){
    //console.log(res.statusText);
    return Promise.reject(res);
  }
  return res;
}, function axiosRetryInterceptor(err) {
    var config = err.config;
    // If config does not exist or the retry option is not set, reject
    if(!config || !config.retry) return Promise.reject(err);
    
    // Set the variable for keeping track of the retry count
    config.__retryCount = config.__retryCount || 0;
    
    // Check if we've maxed out the total number of retries
    if(config.__retryCount >= config.retry) {
        // Reject with the error
        return Promise.reject(err);
    }
    
    // Increase the retry count
    config.__retryCount += 1;
    
    // Create new promise to handle exponential backoff
    var backoff = new Promise(function(resolve) {
        setTimeout(function() {
            resolve();
        }, config.retryDelay || 1);
    });
    
    // Return the promise in which recalls axios to retry the request
    return backoff.then(function() {
        return axios(config);
    });
});
export default axios;

/*
import Vue from 'vue'
import axios from 'axios'
import {Indicator} from 'mint-ui'
Vue.component(Indicator)
let CancelToken = axios.CancelToken //取消请求
let cancelFlag = true
//设置公共部分，请求头和超时时间
axios.defaults.headers = {
    'X-Requested-With': 'XMLHttpRequest'
}
axios.defaults.timeout = 20000
//在请求拦截器时
axios.interceptors.request.use(config => {
    if (cancelFlag) {
        cancelFlag = false
        Indicator.open()
    } else {
        cancelToken: new CancelToken (c => {
            cancel = c
        })
        cancel()
    }
    return config
}, error => {
    return Promise.reject(error)
})
axios.interceptors.response.use(config => {
    cancelFlag = true
    Indicator.close()
    return config
}, error => {
    //
})

axios.interceptors.request.use(config => {
    let requestName = config.data.requestName
    if (requestName) {
        if (axios[requestName] && axios[requestName].cancel) {
            axios[requestName].cancel()
        }
        config.cancelToken = new CancelToken (c => {
            axios[requestName] = {}
            axios[requestName].cancel = c
        })
    }
    return config
}, error => {
    return Promise.reject(error)
})

axios.interceptors.response.use(config => {
    Indicator.close()
    return config
}, error => {
    cancelFlag = true
    Indicator.close()
    if (error && error.response) {
        switch (error.response.status) {
            case 400:
                error.message = '错误请求'
                break;
            case 401:
                error.message = '未授权，请重新登录'
                break;
            case 403:
                error.message = '拒绝访问'
                break;
            case 404:
                error.message = '请求错误,未找到该资源'
                break;
            case 405:
                error.message = '请求方法未允许'
                break;
            case 408:
                error.message = '请求超时'
                break;
            case 500:
                error.message = '服务器端出错'
                break;
            case 501:
                error.message = '网络未实现'
                break;
            case 502:
                error.message = '网络错误'
                break;
            case 503:
                error.message = '服务不可用'
                break;
            case 504:
                error.message = '网络超时'
                break;
            case 505:
                error.message = 'http版本不支持该请求'
                break;
            default:
            error.message = `连接错误${error.response.status}`
        }
      } else {
        error.message = "连接到服务器失败"
      }
    return Promise.reject(error.message)
})

import Vue from 'vue'
import axios from './axios'
import 'mint-ui/lib/style.css';
import {Toast} from 'mint-ui'
Vue.component(Toast)
export function post (url, data, error) {
    return new Promise((resolve, reject) => {
        axios.post(url, data).then(res => {
            resolve(res)
        }, err => {
            err = error ? error : err
            Toast({
                message: err,
                duration: 500
            })
        })
    })
}
export function get (url, data, error) {
    return new Promise((resolve, reject) => {
        axios.post(url, {
            data: data
        }).then(res => {
            resolve(res)
        }, err => {
            err = error ? error : err
            Toast({
                message: err,
                duration: 500
            })
        })
    })
}

import axios from '../utils/axios.js'
import {post, get} from '../utils/http.js'
Vue.prototype.$axios = axios
Vue.prototype.$post = post
Vue.prototype.$get = get

this.$post('/api/saveInfo', {
    value: this.value,
    requestName: 'name01'
}, '请求失败啦~~~').then(res => {
    // alert(res.data)
})

*/
