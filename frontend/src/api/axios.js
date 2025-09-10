import axios from "axios";

let BASE_URL;

if (process.env.NODE_ENV === "production") {
  console.log("Running in Production Mode");
  // BASE_URL = "https://backend-white-water-1093.fly.dev/api";
} else {
  console.log("Running in Development Mode");
  BASE_URL = "http://localhost:5000/api";
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔍 Optional: Error logging for debugging
const logErrorToConsole = (error) => {
  console.error("API Error:", {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method,
  });
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    logErrorToConsole(error);

    if (error.response && error.response.status === 401) {
      window.location.href = "/login";
    }

    return Promise.reject(error.response?.data || error);
  }
);

export const get = async (url, params = {}, config = {}) => {
  return axiosInstance.get(url, { params, ...config }).then((res) => res.data);
};

export const post = async (url, data) => {
  return axiosInstance.post(url, data).then((res) => res.data);
};

export const put = async (url, data) => {
  return axiosInstance.put(url, data).then((res) => res.data);
};

export const patch = async (url, data) => {
  return axiosInstance.patch(url, data).then((res) => res.data);
};

export const _delete = async (url) => {
  return axiosInstance.delete(url).then((res) => res.data);
};

export const postBlob = async (url, data = {}, config = {}) => {
  return axiosInstance.post(url, data, { responseType: "blob", ...config });
};

export const uploadFile = async (url, formData, config = {}) => {
  return axiosInstance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config
  }).then((res) => res.data);
};


export default axiosInstance;
