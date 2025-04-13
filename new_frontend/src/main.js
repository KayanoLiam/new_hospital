import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios'

// 创建 Pinia 实例
const pinia = createPinia()

// 创建 Vue 应用实例
const app = createApp(App)

// 配置 axios
axios.defaults.baseURL = '/api'

// 添加请求拦截器
axios.interceptors.request.use(
  config => {
    // 这里可以添加认证信息等
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // 处理响应错误
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权
          console.error('未授权，请登录')
          break
        case 404:
          // 资源不存在
          console.error('请求的资源不存在')
          break
        default:
          console.error(`服务器错误: ${error.response.status}`)
      }
    } else {
      console.error('网络错误或服务器未响应')
    }
    return Promise.reject(error)
  }
)

// 将 axios 添加到全局属性
app.config.globalProperties.$axios = axios

// 使用插件
app.use(router)
app.use(pinia)
app.use(ElementPlus)

// 挂载应用
app.mount('#app')
