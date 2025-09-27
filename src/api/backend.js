import axios from "axios";
import defaultSetting from "@/api/config.js";
import router from "@/router";

const testing =  true;//localStorage.getItem("mode") === "testing";

const API_BASE_URL = testing
  ? "https://testing.sweetyhome.net.mm/api/b2c/v1" // testing URL
  : import.meta.env.VITE_BACKEND_URL; // live URL from env

// Interceptors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        localStorage.removeItem("adminToken");
        router.push(`/`);
      } else if (status === 403) {
        router.push("/no-permission");
      }
    }
    return Promise.reject(error);
  }
);

// Core request builder
function request(method, url, { params, data, headers } = {}) {
  return axios({
    baseURL: API_BASE_URL,
    method,
    url,
    params,
    data,
    headers,
  });
}

// Param formatter
function formatParams(params = {}) {
  const formatted = params?.params ? { ...params.params } : { ...params };
  Object.keys(formatted).forEach((key) => {
    if (formatted[key] instanceof Date) {
      formatted[key] = formatted[key].toLocaleString("sv-SE");
    }
  });
  return formatted;
}

// API helpers
function get(url, params) {
  return request("get", url, {
    params: formatParams(params),
    headers: defaultSetting.header(),
  });
}

function post(url, data) {
  return request("post", url, {
    data,
    headers: defaultSetting.header(),
  });
}

function put(url, data) {
  return request("put", url, {
    data,
    headers: defaultSetting.header(),
  });
}

function destroy(url, data) {
  return request("delete", url, {
    data,
    headers: defaultSetting.header(),
  });
}

function filePost(url, data) {
  return request("post", url, {
    data,
    headers: defaultSetting.fileHeader(),
  });
}

export default { get, post, put, destroy, filePost };
