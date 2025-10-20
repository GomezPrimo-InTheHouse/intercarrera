// src/services/AuthService.js
import api from "../api/axios.js";
import axios from "axios";

const API_URL = "http://localhost:4000";

const AuthService = {
  register: async (payload) => {
    // Si tu instancia `api` tiene baseURL = "http://localhost:4000/api",
    // este path está OK:
    return (await api.post("/auth/register", payload)).data;
  },

  login: async ({ email, password, totp }) => {
    const basic = "Basic " + btoa(`${email}:${password}`);

    const resp = await axios.post(
      `${API_URL}/api/auth/login`,                 // 👈 asegúrate del /api/
      { totp, totpCode: totp || undefined },      // 👈 mandamos ambos por compatibilidad
      { headers: { Authorization: basic, "Content-Type": "application/json" } }
    );

    const data = resp.data;
    if (data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("auth_email", email);
    }
    return data;
  },

  logout: async ({ all = false } = {}) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    await axios.post(
      `${API_URL}/api/auth/logout`,
      { refreshToken, all },
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" },
      }
    );
  } catch (_) {
    // ignore
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("auth_email");
    delete api.defaults.headers.common["Authorization"];
  }
},

  refreshAccessToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No hay refreshToken");

    const resp = await axios.post(`${API_URL}/api/auth/refresh-token`, { refreshToken }); // 👈 /api/ agregado
    const data = resp.data;
    if (data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
    }
    return data;
  },

  // Solo si implementaste /api/totp/verify
  totpVerify: async ({ userId, code }) => {
    // si tu instancia `api` tiene baseURL = "http://localhost:4000/api"
    // este path correcto es con barra inicial y prefijo /totp
    const resp = await api.post("/auth/verify", { userId, code });
    return resp.data;
  },
};

export default AuthService;
