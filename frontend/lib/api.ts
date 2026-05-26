// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000/api/",
// });


// api.interceptors.request.use((config) => {
//   if (typeof window !== "undefined") {

//     const token = localStorage.getItem("access")
//     const isAuthPage =
//       config.url?.includes("/auth/login/") ||
//       config.url?.includes("/auth/register/");

//   if (token && !isAuthPage) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
// }

//   return config
// })

// export default api
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refresh")
    ) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");

        const res = await axios.post("http://127.0.0.1:8000/api/auth/token/refresh/", {
          refresh,
        });

        const newAccess = res.data.access;
        localStorage.setItem("access", newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;