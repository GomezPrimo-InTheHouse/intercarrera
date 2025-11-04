// src/api/unifiedApi.js
import axios from "axios";
import { emit } from "../utils/eventBus.js";

/* =========================
   BASE URLs (ENV + defaults)
   ========================= */
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4002").replace(/\/$/, "");

export const API_BASE_URL_V2 =
  (import.meta.env.VITE_API_URL_V2 ?? "http://localhost:4000").replace(/\/$/, ""); // <- fix de "http://http://..."

const API_BASE_URL_BACKEND =
  (import.meta.env.VITE_API_URL_BACKEND ?? "http://localhost:4000/api").replace(/\/$/, "");

/* =========================
   CLIENTES AXIOS
   ========================= */

// A) Cliente "secure" con refresh-token (≡ tu src/api/axios.js)
const api = axios.create({
  baseURL: API_BASE_URL_BACKEND,
  withCredentials: true, // future-proof
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
const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Bearer en cada request
api.interceptors.request.use((config) => {
  const at = localStorage.getItem("accessToken");
  if (at && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${at}`;
  }
  return config;
});

// Manejo de 401 → refresh
api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;
    if (!error.response) return Promise.reject(error);

    console.debug("[AX] error", {
      url: originalRequest?.url,
      status: error.response.status,
      body: error.response.data,
    });
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

      // axios “crudo” para evitar interceptores
      const resp = await axios.post(
        `${API_BASE_URL_BACKEND}/auth/refresh-token`,
        { refreshToken }, // tu backend espera { refreshToken }
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
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

// B) Cliente del microservicio MQTT (≡ connectionApiMqtt.js)
const mqttApi = axios.create({
  baseURL: "http://localhost:3002", // idéntico a tu original
  timeout: 8000,
});

// C) Clientes “planos” para V1/V2 (≡ connectionApi.js)
const httpV1 = axios.create({ baseURL: API_BASE_URL });
const httpV2 = axios.create({ baseURL: API_BASE_URL_V2 });

/* =========================
   FUNCIONES (misma firma)
   ========================= */

/* ----- (1) MQTT: enviar acciones/títulos y health ----- */

/**
 * Enviar comando al robot
 * @param {string} action - avanzar | frenar | izquierda | derecha | girar
 * @param {string} robotId - UUID del robot (opcional)
 */
export async function sendRobotAction(action, robotId = null) {
  try {
    const payload = { type: "action", action };
    if (robotId) payload.robot_id = robotId;

    const { data } = await mqttApi.post("/api/mqtt/control", payload);
    return data;
  } catch (error) {
    console.error("[sendRobotAction] error:", error);
    throw error.response?.data || error;
  }
}

/**
 * Enviar título de música al robot
 * @param {string} title - Título o nombre de la canción
 * @param {string} robotId - UUID del robot (opcional)
 */
export async function sendRobotTitle(title, robotId = null) {
  try {
    const payload = { type: "title", title };
    if (robotId) payload.robot_id = robotId;

    const { data } = await mqttApi.post("/api/mqtt/control", payload);
    return data;
  } catch (error) {
    console.error("[sendRobotTitle] error:", error);
    throw error.response?.data || error;
  }
}

/**
 * Endpoint de salud para verificar si el backend está corriendo
 */
export async function checkBackendHealth() {
  try {
    const { data } = await mqttApi.get("/health");
    return data;
  } catch (error) {
    console.error("[checkBackendHealth] error:", error);
    return { ok: false };
  }
}

/* ----- (2) Spotify / IA (≡ connectionApi.js) ----- */

export function waitForSpotifyAuthOK({ popupRef, timeoutMs = 60000 }) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      window.removeEventListener("message", onMsg);
      try {
        popupRef?.current?.close();
      } catch {}
      reject(new Error("Timeout esperando autenticación de Spotify"));
    }, timeoutMs);

    function onMsg(ev) {
      if (ev?.data?.type === "SPOTIFY_AUTH_OK") {
        clearTimeout(timer);
        window.removeEventListener("message", onMsg);
        resolve(true);
      }
    }

    window.addEventListener("message", onMsg);
  });
}

/**
 * Envía audio al backend. Maneja 401 (login Spotify) con popup reutilizable.
 * @param {Blob} audioBlob
 * @param {{ popupRef?: React.MutableRefObject<Window|null>, authInProgressRef?: React.MutableRefObject<boolean> }} opts
 */
export async function sendVoiceCommand(audioBlob, { popupRef, authInProgressRef } = {}) {
  const formData = new FormData();

  // 🔔 1) Spinner ON (inicia envío)
  emit("spotify:newHistorial:pending");

  try {
    formData.append("audio", audioBlob, `voice-${Date.now()}.webm`);

    const url = `${API_BASE_URL}/apiChat/ai/voice`;

    const res = await httpV1.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      validateStatus: () => true,
    });

    // ✅ Éxito directo
    if (res.data?.success) {
      emit("spotify:newHistorial", res.data);
      return res.data;
    }

    // 🔐 401 → flujo de login
    if (res.status === 401 && res.data?.loginUrl) {
      // evita doble popup
      if (authInProgressRef?.current) {
        await new Promise((r) => setTimeout(r, 800));
        const again = await sendVoiceCommand(audioBlob, { popupRef, authInProgressRef });
        return again;
      }

      if (authInProgressRef) authInProgressRef.current = true;

      // asegurar popup
      if (!popupRef?.current || popupRef.current.closed) {
        try {
          popupRef.current = window.open("about:blank", "spotifyAuth", "width=500,height=720");
        } catch {
          popupRef.current = null;
        }
      }

      if (popupRef?.current && !popupRef.current.closed) {
        try {
          popupRef.current.location = res.data.loginUrl;
        } catch {
          const err = new Error("No se pudo redirigir el popup al login");
          err.needManualLogin = true;
          err.loginUrl = res.data.loginUrl;
          if (authInProgressRef) authInProgressRef.current = false;
          throw err;
        }

        // esperar a que el login termine
        await waitForSpotifyAuthOK({ popupRef });
        await new Promise((r) => setTimeout(r, 1000)); // settle

        // reintento post-auth
        const retry = await httpV1.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          validateStatus: () => true,
        });

        if (authInProgressRef) authInProgressRef.current = false;

        if (retry.data?.success) {
          emit("spotify:newHistorial", retry.data);
          return retry.data;
        }

        if (retry.status === 401 && retry.data?.loginUrl) {
          const err = new Error("Se requiere login de Spotify");
          err.needManualLogin = true;
          err.loginUrl = retry.data.loginUrl;
          throw err;
        }

        const err = new Error(retry.data?.error || "Error tras autenticación");
        throw err;
      }

      // sin popup utilizable → login manual
      const err = new Error("Necesita login de Spotify");
      err.needManualLogin = true;
      err.loginUrl = res.data.loginUrl;
      if (authInProgressRef) authInProgressRef.current = false;
      throw err;
    }

    // ❌ Otros errores controlados por backend
    const err = new Error(res.data?.error || "Error en transcripción/comando");
    throw err;
  } finally {
    // 🔔 3) Spinner OFF (siempre)
    emit("spotify:newHistorial:done");
  }
}

export async function getAiStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/apiChat/ai/status`);
    if (!res.ok) throw new Error("Error al obtener estado de la IA");
    return await res.json();
  } catch (error) {
    console.error("❌ Error en getAiStatus:", error);
    return { status: "offline" };
  }
}

export async function getLastHistorialSpotify() {
  try {
    const res = await fetch(`${API_BASE_URL_BACKEND}/api/spotify-db/historial/last`);
    if (!res.ok) throw new Error("Error al obtener el historial");
    return await res.json();
  } catch (error) {
    console.error("❌ Error en getLastHistorial:", error);
    return { historial: [] };
  }
}

// comando para enviar solo texto
export async function postSpotifyComando(orden) {
  try {
    const { data } = await httpV2.post(`/api/spotify/comando`, { orden }, { timeout: 15000 });
    return data; // { success, mensaje, track }
  } catch (err) {
    // Normalizamos error
    const status = err?.response?.status || 0;
    const data = err?.response?.data;
    const e = new Error(data?.error || err.message || "Error ejecutando comando");
    e.status = status;
    e.data = data;
    throw e;
  }
}

export async function getSpotifyStatus() {
  const { data } = await httpV2.get(`/api/spotify/status`, { timeout: 10000 });
  return data; // { authenticated: boolean, loginUrl: string }
}

/* =========================
   EXPORTS
   ========================= */

// Cliente "secure" con refresh-token (reemplaza a src/api/axios.js)
export default api;

// Clientes adicionales por si necesitás llamarlos directo:
export { mqttApi, httpV1, httpV2 };
