import axios from "axios";
import defaultSetting from "@/api/config.js";
import router from "@/router";

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        localStorage.removeItem("adminToken");
        router.push(`/`);
      } else if (status === 403) {
        router.push("/no-permission");
      } else if (status === 500) {
        //
      }
    } else {
      // toast.error('Unknown Error Occure!')
    }
    return Promise.reject(error);
  }
);

function get(url, params) {
  // Support both { params: { key: value } } and { key: value }
  const formattedParams = params?.params ? { ...params.params } : { ...params };

  // Convert Date objects to local formatted string manually
  Object.keys(formattedParams).forEach((key) => {
    if (formattedParams[key] instanceof Date) {
      formattedParams[key] = formattedParams[key].toLocaleString("sv-SE"); // e.g. 2025-09-02 00:00:00
    }
  });

  return axios({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    method: "get",
    url,
    params: formattedParams,
    headers: defaultSetting.header(),
  });
}

function post(url, data) {
  return axios({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    method: "post",
    url,
    data,
    headers: defaultSetting.header(),
  });
}

function put(url, data) {
  return axios({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    method: "put",
    url,
    data,
    headers: defaultSetting.header(),
  });
}

function destroy(url, data) {
  return axios({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    method: "delete",
    url,
    data,
    headers: defaultSetting.header(),
  });
}

function filePost(url, data) {
  return axios({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    method: "post",
    url,
    data,
    headers: defaultSetting.fileHeader(),
  });
}

export default {
  get,
  post,
  put,
  destroy,
  filePost,
};
