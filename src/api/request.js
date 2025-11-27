// src/api/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
    baseURL: '/api',
    timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
    config => {
        // 自动添加token
<<<<<<< Updated upstream
<<<<<<< HEAD
=======
        config.headers = config.headers || {}
>>>>>>> Stashed changes
        const token = localStorage.getItem('token')
=======
        config.headers = config.headers || {}
        const token = sessionStorage.getItem('token') || localStorage.getItem('token')
>>>>>>> 16bd7400f4a7b2f8ed2b379b3664930ebe28314d
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        ElMessage.error('请求出错，请稍后再试')
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    response => {
        const res = response.data
        // 如果后端返回的不是成功状态，或者success字段为false，则抛出错误
        // 注意：某些成功操作（如验证码生成）可能没有code字段，只有success字段
        if (res.success === false) {
            ElMessage.error(res.message || '操作失败');
            return Promise.reject(new Error(res.message || 'Error'));
        } else if (res.code !== undefined && res.code !== 200 && res.code !== 201) {
            // 如果存在code字段，并且不是200/201，也认为是错误
            ElMessage.error(res.message || '操作失败');
            return Promise.reject(new Error(res.message || 'Error'));
        }
        return res
    },
    error => {
<<<<<<< Updated upstream
<<<<<<< HEAD
        ElMessage.error('网络错误，请检查网络连接')
=======
=======
>>>>>>> Stashed changes
        const res = error.response
        if (res) {
            const msg = (res.data && res.data.message) ? res.data.message : `请求失败(${res.status})`
            ElMessage.error(msg)
            if (res.status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
<<<<<<< Updated upstream
                sessionStorage.removeItem('token')
                sessionStorage.removeItem('user')
=======
>>>>>>> Stashed changes
            }
        } else {
            ElMessage.error('网络错误，请检查网络连接')
        }
<<<<<<< Updated upstream
>>>>>>> 16bd7400f4a7b2f8ed2b379b3664930ebe28314d
=======
>>>>>>> Stashed changes
        return Promise.reject(error)
    }
)

export default request