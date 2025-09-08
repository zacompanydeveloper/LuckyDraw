import axios from 'axios'
import defaultSetting from '@/api/config.js'
import router from '@/router'
import { toast } from 'vue3-toastify'
import helper from '@/helper'

axios.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    if (error.response) {
      const status = error.response.status

      if (status === 401) {
        localStorage.removeItem('apiToken')
        router.push(`/`)
      } else if (status === 403) {
        router.push('/no-permission')
      } else if (status === 500) {
        //
      }
    } else {
      // toast.error('Unknown Error Occure!')
    }
    return Promise.reject(error)
  },
)

function get(url, params) {
  return axios({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    method: 'get',
    url,
    params,
    headers: defaultSetting.header(),
  })
}

function post(url, data) {
  return axios({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    method: 'post',
    url,
    data,
    headers: defaultSetting.header(),
  })
}

function put(url, data) {
  return axios({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    method: 'put',
    url,
    data,
    headers: defaultSetting.header(),
  })
}

function destroy(url, data) {
  return axios({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    method: 'delete',
    url,
    data,
    headers: defaultSetting.header(),
  })
}

function filePost(url, data) {
  return axios({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    method: 'post',
    url,
    data,
    headers: defaultSetting.fileHeader(),
  })
}

export default {
  get,
  post,
  put,
  destroy,
  filePost,
}