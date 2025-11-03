// // src/api/axios.js
// import axios from "axios";

// const API_BASE_URL = import.meta.env.VITE_API_URL_BACKEND || "http://localhost:4000/api";
// const API_URL = `${API_BASE_URL}`.replace(/\/$/, "");

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     "Content-Type": "application/json",
//     "ngrok-skip-browser-warning": "true",
//   },
//   params: { "ngrok-skip-browser-warning": "true" },
// });

// // --- Manejo de refresh en concurrencia ---
// let isRefreshing = false;
// let refreshSubscribers = [];
// function subscribeTokenRefresh(cb) { refreshSubscribers.push(cb); }
// function onRefreshed(token) { refreshSubscribers.forEach(cb => cb(token)); refreshSubscribers = []; }

// // Bearer en cada request
// api.interceptors.request.use((config) => {
//   const at = localStorage.getItem("accessToken");
//   if (at && !config.headers["Authorization"]) {
//     config.headers["Authorization"] = `Bearer ${at}`;
//   }
//   return config;
// });

// // Dispara refresh en 401 o (403 con error de token)
// api.interceptors.response.use(
//   (resp) => resp,
//   async (error) => {
//     const originalRequest = error.config;

//     if (!error.response) return Promise.reject(error);
//     const status = error.response.status;

//     const urlStr = originalRequest?.url || "";
//     const isAuthEndpoint =
//       urlStr.includes("/auth/login") ||
//       urlStr.includes("/auth/register") ||
//       urlStr.includes("/auth/totp-verify") ||
//       urlStr.includes("/auth/refresh-token");
//     if (isAuthEndpoint) return Promise.reject(error);

//     const bodyMsg = (error.response?.data?.error || "").toString().toLowerCase();
//     const shouldAttemptRefresh = status === 401 || (status === 403 && bodyMsg.includes("token"));
//     if (!shouldAttemptRefresh) return Promise.reject(error);

//     if (originalRequest._retry) return Promise.reject(error);
//     originalRequest._retry = true;

//     if (isRefreshing) {
//       return new Promise((resolve, reject) => {
//         subscribeTokenRefresh((token) => {
//           if (!token) return reject(error);
//           originalRequest.headers["Authorization"] = "Bearer " + token;
//           resolve(api(originalRequest));
//         });
//       });
//     }

//     isRefreshing = true;
//     try {
//       const refreshToken = localStorage.getItem("refreshToken");
//       if (!refreshToken) {
//         onRefreshed(null);
//         throw new Error("No hay refreshToken en localStorage");
//       }

//       // axios “crudo” para evitar los interceptores
//       const resp = await axios.post(
//         `${API_URL}/auth/refresh-token`,
//         { refreshToken },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "ngrok-skip-browser-warning": "true",
//           },
//           params: { "ngrok-skip-browser-warning": "true" },
//         }
//       );

//       const newAccessToken = resp.data?.accessToken;
//       const newRefreshToken = resp.data?.refreshToken || refreshToken;
//       if (!newAccessToken) throw new Error("Refresh inválido: falta accessToken");

//       localStorage.setItem("accessToken", newAccessToken);
//       localStorage.setItem("refreshToken", newRefreshToken);

//       api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
//       onRefreshed(newAccessToken);

//       originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
//       return api(originalRequest);
//     } catch (refreshError) {
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");
//       localStorage.removeItem("auth_email");
//       onRefreshed(null);
//       return Promise.reject(refreshError);
//     } finally {
//       isRefreshing = false;
//     }
//   }
// );

// export default api;

// src/api/axios.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL_BACKEND || "http://localhost:4000/api";
const API_URL = `${API_BASE_URL}`.replace(/\/$/, "");

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // “future-proof”, no rompe aunque hoy uses localStorage
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  params: { "ngrok-skip-browser-warning": "true" },
});

// --- refresh en concurrencia ---
let isRefreshing = false;
let refreshSubscribers = [];
const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
const onRefreshed = (token) => { refreshSubscribers.forEach((cb) => cb(token)); refreshSubscribers = []; };

// Bearer en cada request
api.interceptors.request.use((config) => {
  const at = localStorage.getItem("accessToken");
  if (at && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${at}`;
  }
  return config;
});

// Dispara refresh SOLO en 401
api.interceptors.response.use(
  // (resp) => resp,
  // async (error) => {
  //   const originalRequest = error.config;
  //   if (!error.response) return Promise.reject(error);
  //   if (error.response.status !== 401) return Promise.reject(error);

  //   const urlStr = originalRequest?.url || "";
  //   const isAuthEndpoint =
  //     urlStr.includes("/auth/login") ||
  //     urlStr.includes("/auth/register") ||
  //     urlStr.includes("/auth/verify") ||        // <- FIX: tu backend usa /auth/verify
  //     urlStr.includes("/auth/refresh-token");

  //   if (isAuthEndpoint) return Promise.reject(error);
  //   if (originalRequest._retry) return Promise.reject(error);
  //   originalRequest._retry = true;

  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;
    if (!error.response) return Promise.reject(error);

    console.debug("[AX] error", { url: originalRequest?.url, status: error.response.status, body: error.response.data });
    if (error.response.status !== 401) return Promise.reject(error);

    const urlStr = originalRequest?.url || "";
    const isAuthEndpoint =
      urlStr.includes("/auth/login") ||
      urlStr.includes("/auth/register") ||
      urlStr.includes("/auth/verify") ||
      urlStr.includes("/auth/refresh-token");

    if (isAuthEndpoint) return Promise.reject(error);
    if (originalRequest._retry) return Promise.reject(error);
    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) return reject(error);
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        onRefreshed(null);
        throw new Error("No hay refreshToken");
      }

      // Usar axios “crudo” para evitar los interceptores
      const resp = await axios.post(
        `${API_URL}/auth/refresh-token`,
        { refreshToken }, // <- Tu backend actual espera esto
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          params: { "ngrok-skip-browser-warning": "true" },
        }
      );

      const newAccessToken = resp.data?.accessToken;
      const newRefreshToken = resp.data?.refreshToken || refreshToken;
      if (!newAccessToken) throw new Error("Refresh inválido: falta accessToken");

      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
      onRefreshed(newAccessToken);

      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("auth_email");
      onRefreshed(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
