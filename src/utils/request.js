import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})

// 请求拦截
service.interceptors.request.use(
  config => {

    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false
    if (store.getters.token && !isToken) {
      config.headers['token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// 响应拦截
service.interceptors.response.use(

  response => {
    const res = response.data

    if (res.code === 6000) {
      // to re-login
      // MessageBox.confirm('登录已过期，请重新登录!', 'Confirm logout', {
      //   confirmButtonText: 'Re-Login',
      //   cancelButtonText: 'Cancel',
      //   type: 'warning'
      // }).then(() => {
      //   store.dispatch('user/ResetToken').then(() => {
      //     location.reload()
      //   })
      // })
      Message({ message: '登录已过期，请重新登录!', type: 'error' })
      store.dispatch('user/ResetToken').then(() => {
        this.$router.push('/login')
      })
      // return Promise.reject('登录已过期，请重新登录!')
    } else if (res.code === 5005) {
      Message({ message: res.msg, type: 'error' })
      setTimeout(function() {
        window.location.href = '/login'
      }, 1500)
      // this.$router.push('/login')
    } else if (res.code === 9999) {
      Message({ message: res.msg, type: 'error' })
      return Promise.reject(new Error(res.msg))
    } else if (res.code !== 2000) {
      Message({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.msg))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    let { message } = error
    if (message === 'Network Error') {
      message = '后端接口连接异常'
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时'
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.substr(message.length - 3) + '异常'
    }
    Message({ message: message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  }
)

export default service
