import axios from "axios";
import { ElMessage } from "element-plus";

const service = axios.create({
  baseURL: process.env.VUE_APP_API_BASE || "/api",
  timeout: 30000,
});

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("staff_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

service.interceptors.response.use(
  (res) => {
    const payload = res.data;
    if (payload && typeof payload.code === "number" && payload.code !== 0) {
      ElMessage.error(payload.message || "请求失败");
      return Promise.reject(new Error(payload.message || "error"));
    }
    return payload?.data !== undefined ? payload : res;
  },
  (err) => {
    const msg =
      err.response?.data?.message || err.message || "网络异常，请稍后重试";
    ElMessage.error(msg);
    return Promise.reject(err);
  }
);

export default service;
