/** axios封装 */
const axios = require('axios')

const axiosInstance = axios.create({
    baseURL: '',
    withCredentials: false,
    timeout: 15000
})

/**
 * request封装
 */
axiosInstance.interceptors.request.use(
    config => {
        return config
    },
    error => { return Promise.reject(error) }
)

/**
 * response封装
 */
axiosInstance.interceptors.response.use(
    response => {
        return response.data
    },
    () => { return }
)
module.exports = axiosInstance
