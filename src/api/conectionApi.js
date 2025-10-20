// // src/api/connectionApi.js
// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:4002";
// import axios from "axios";

// /**
//  * Envía un audio grabado al backend para su transcripción e interpretación.
//  * @param {Blob} audioBlob - Archivo de audio (formato .webm)
//  * @returns {Promise<{ text: string, track?: { name, artist, image, url } }>}
//  */
// // export async function sendVoiceCommand(audioBlob) {
// //   const formData = new FormData();
// //   formData.append("audio", audioBlob, `voice-${Date.now()}.webm`);

// //   try {
// //     const response = await fetch(`${API_BASE_URL}/api/ai/voice`, {
// //       method: "POST",
// //       body: formData,
// //     });

// //     if (!response.ok) {
// //       const msg = await response.text();
// //       throw new Error(msg || "Error en la transcripción");
// //     }

// //     return await response.json();
// //   } catch (error) {
// //     console.error("❌ Error en sendVoiceCommand:", error);
// //     throw error;
// //   }
// // }

// // export async function sendVoiceCommand(audioBlob) {
// //   const formData = new FormData();
// //   formData.append("audio", audioBlob, `voice-${Date.now()}.webm`);

// //   try {
// //     const { data } = await axios.post(
// //       `${API_BASE_URL}/apiChat/ai/voice`,
// //       formData,
// //       { headers: { "Content-Type": "multipart/form-data" } }
// //     );
// //     console.log("✅ Respuesta backend:", data);
// //     return data;
// //   } catch (error) {
// //     console.error("❌ Error en sendVoiceCommand:", error.response?.data || error.message);
// //     throw error.response?.data || error;
// //   }
// // }

// export async function sendVoiceCommand(audioBlob) {
//   const formData = new FormData();
//   formData.append("audio", audioBlob, `voice-${Date.now()}.webm`);

//   try {
//     const { data } = await axios.post(`${API_BASE_URL}/apiChat/ai/voice`, formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//       validateStatus: () => true, // manejamos manualmente
//     });

//     if (data && data.success) return data;

//     // ⚠️ 401: falta login → abrir popup y reintentar
//     if (data && data.loginUrl) {
//       const popup = window.open(data.loginUrl, "_blank", "width=480,height=720");
//       if (!popup) throw new Error("No pude abrir el popup de Spotify");

//       return await new Promise((resolve, reject) => {
//         const timer = setTimeout(() => {
//           window.removeEventListener("message", onMsg);
//           try { popup.close(); } catch {}
//           reject(new Error("Timeout esperando autenticación de Spotify"));
//         }, 60_000);

//         function onMsg(ev) {
//           // el callback envía { type: "SPOTIFY_AUTH_OK" }
//           if (ev?.data?.type === "SPOTIFY_AUTH_OK") {
//             clearTimeout(timer);
//             window.removeEventListener("message", onMsg);
//             try { popup.close(); } catch {}
//             // reintentar la misma llamada
//             sendVoiceCommand(audioBlob).then(resolve).catch(reject);
//           }
//         }
//         window.addEventListener("message", onMsg);
//       });
//     }

//     // otros errores
//     throw new Error(data?.error || "Error en transcripción/comando");
//   } catch (err) {
//     console.error("❌ Error en sendVoiceCommand:", err);
//     throw err;
//   }
// }

// /**
//  * Ejemplo de endpoint adicional: obtener estado del bot o IA
//  * (útil si en el futuro querés mostrar “sistema listo / ocupado”)
//  */
// export async function getAiStatus() {
//   try {
//     const response = await fetch(`${API_BASE_URL}/apiChat/ai/status`);
//     if (!response.ok) throw new Error("Error al obtener estado de la IA");
//     return await response.json();
//   } catch (error) {
//     console.error("❌ Error en getAiStatus:", error);
//     return { status: "offline" };
//   }
// }


// frontend/src/api/connectionApi.js (FIXED)
// 🔧 Cambios clave:
// - Usa SIEMPRE el mismo endpoint base (VITE_API_URL)
// - Maneja 401 con popup REUTILIZABLE (popupRef) y reintento
// - Expone waitForSpotifyAuthOK para integrarlo con el componente
// - validateStatus para no lanzar excepciones automáticas

import axios from "axios";
import { emit } from "../utils/eventBus.js";
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:4002";

export const API_BASE_URL_V2 = import.meta.env.VITE_API_URL_V2 || "http://http://localhost:4000";



export function waitForSpotifyAuthOK({ popupRef, timeoutMs = 60000 }) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      window.removeEventListener("message", onMsg);
      try { popupRef?.current?.close(); } catch {}
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
// export async function sendVoiceCommand(audioBlob, { popupRef, authInProgressRef } = {}) {
//   const formData = new FormData();
//     // 🚨 avisa que empieza el envío (mostrar spinner)
//   emit("spotify:newHistorial:pending");

//   formData.append("audio", audioBlob, `voice-${Date.now()}.webm`);

//   // ❗ Ruta por convención: /apiChat/ai/voice  (ajusta si usás /api/ai/voice)
//   const url = `${API_BASE_URL}/apiChat/ai/voice`;

//   const res = await axios.post(url, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//     validateStatus: () => true,
//   });

//   // éxito normal
//   // if (res.data?.success) return res.data;

//       // ✅ Éxito directo
//     if (res.data?.success) {
//       // 🔔 Avísale a la tabla que hay un nuevo registro (refetch)
//       emit("spotify:newHistorial", res.data);
//       return res.data;
//     }

//   // Falta login → 401 con loginUrl
//   if (res.status === 401 && res.data?.loginUrl) {
//     // Si ya hay auth en curso, espera y reintenta (evita doble popups)
//     if (authInProgressRef?.current) {
//       await new Promise((r) => setTimeout(r, 800));
//       return await sendVoiceCommand(audioBlob, { popupRef, authInProgressRef });
//     }

//     if (authInProgressRef) authInProgressRef.current = true;

//     // Asegurar popup reutilizable (pre-abierto desde el click del usuario)
//     if (!popupRef?.current || popupRef.current.closed) {
//       try {
//         popupRef.current = window.open("about:blank", "spotifyAuth", "width=500,height=720");
//       } catch {
//         popupRef.current = null;
//       }
//     }

//     if (popupRef?.current && !popupRef.current.closed) {
//       try {
//         popupRef.current.location = res.data.loginUrl;
//       } catch {
//         const err = new Error("No se pudo redirigir el popup al login");
//         err.needManualLogin = true;
//         err.loginUrl = res.data.loginUrl;
//         if (authInProgressRef) authInProgressRef.current = false;
//         throw err;
//       }

//       await waitForSpotifyAuthOK({ popupRef });
//       await new Promise((r) => setTimeout(r, 1000)); // settle DB write

//       const retry = await axios.post(url, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         validateStatus: () => true,
//       });

//       if (authInProgressRef) authInProgressRef.current = false;

//       if (retry.data?.success) return retry.data;

//       if (retry.status === 401 && retry.data?.loginUrl) {
//         const err = new Error("Se requiere login de Spotify");
//         err.needManualLogin = true;
//         err.loginUrl = retry.data.loginUrl;
//         throw err;
//       }

//       const err = new Error(retry.data?.error || "Error tras autenticación");
//       throw err;
//     }

//     // Sin popup utilizable → forzar login manual (último recurso)
//     const err = new Error("Necesita login de Spotify");
//     err.needManualLogin = true;
//     err.loginUrl = res.data.loginUrl;
//     if (authInProgressRef) authInProgressRef.current = false;
//     throw err;
//   }

//   // Otros errores controlados por el backend
//   const err = new Error(res.data?.error || "Error en transcripción/comando");
//   throw err;
// }



export async function sendVoiceCommand(audioBlob, { popupRef, authInProgressRef } = {}) {
  const formData = new FormData();

  // 🔔 1) Spinner ON (inicia envío)
  emit("spotify:newHistorial:pending");

  try {
    formData.append("audio", audioBlob, `voice-${Date.now()}.webm`);

    const url = `${API_BASE_URL}/apiChat/ai/voice`;

    const res = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      validateStatus: () => true,
    });

    // ✅ Éxito directo
    if (res.data?.success) {
      // 🔔 Avísale a la tabla que hay un nuevo registro (refetch)
      emit("spotify:newHistorial", res.data);
      return res.data;
    }

    // 🔐 401 → flujo de login
    if (res.status === 401 && res.data?.loginUrl) {
      // evita doble popup: si ya hay login en curso, espera y reintenta
      if (authInProgressRef?.current) {
        await new Promise((r) => setTimeout(r, 800));
        const again = await sendVoiceCommand(audioBlob, { popupRef, authInProgressRef });
        // (El sendVoiceCommand interno ya emite pending/done por sí mismo)
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

        // esperar a que el login termine correctamente
        await waitForSpotifyAuthOK({ popupRef });

        // pequeño settle para escritura en DB
        await new Promise((r) => setTimeout(r, 1000));

        // reintento post-auth
        const retry = await axios.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          validateStatus: () => true,
        });

        if (authInProgressRef) authInProgressRef.current = false;

        if (retry.data?.success) {
          // ✅ Éxito tras login → avisar a la tabla
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

      // sin popup utilizable → forzar login manual
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


export async function getLastHistorialSpotify (){
  try {
    const res = await fetch(`${API_BASE_URL_V2}/api/spotify-db/historial/last`);
    if (!res.ok) throw new Error("Error al obtener el historial");
    return await res.json();
    
  } catch (error) {
    console.error("❌ Error en getLastHistorial:", error);
    return { historial: [] };
  }
}
