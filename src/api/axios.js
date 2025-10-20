// src/api/axios.js
import axios from "axios";

const API_URL = "http://localhost:4000/api"; // 👈 puerto 4000

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// --- Manejo de refresh en concurrencia ---
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}
function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// request: si hay accessToken en localStorage lo pone (excepto si ya setearon otro Authorization)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// response: si 401 -> intenta refresh (excepto si ya es refresh-token)
api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // No reintentar refresh si ya estamos en el endpoint de refresh
    if (originalRequest.url?.includes("/auth/refresh-token")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("auth_email");
      return Promise.reject(error);
    }

    if (originalRequest._retry) return Promise.reject(error);
    originalRequest._retry = true;

    if (isRefreshing) {
      // esperar a que finalice el refresh en curso
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) return reject(error);
          originalRequest.headers["Authorization"] = "Bearer " + token;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshToken = localStorage.getItem("refreshToken"); // 👈 usamos refreshToken
      if (!refreshToken) {
        onRefreshed(null);
        throw new Error("No hay refreshToken");
      }

      // tu backend: POST /auth/refresh-token
      // sugerido body: { refreshToken } (evitar usar email)
      const resp = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });

      const newAccessToken = resp.data?.accessToken;
      const newRefreshToken = resp.data?.refreshToken || refreshToken;

      if (!newAccessToken) {
        throw new Error("Respuesta de refresh inválida");
      }

      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // actualizar defaults y notificar a los suscriptores
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
      onRefreshed(newAccessToken);

      // reintento original
      originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
      return api(originalRequest);
    } catch (refreshError) {
      // no se pudo renovar -> limpiar y propagar
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
