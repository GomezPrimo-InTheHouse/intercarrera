// src/api/connectionApi.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:4002";
import axios from "axios";

/**
 * Envía un audio grabado al backend para su transcripción e interpretación.
 * @param {Blob} audioBlob - Archivo de audio (formato .webm)
 * @returns {Promise<{ text: string, track?: { name, artist, image, url } }>}
 */
// export async function sendVoiceCommand(audioBlob) {
//   const formData = new FormData();
//   formData.append("audio", audioBlob, `voice-${Date.now()}.webm`);

//   try {
//     const response = await fetch(`${API_BASE_URL}/api/ai/voice`, {
//       method: "POST",
//       body: formData,
//     });

//     if (!response.ok) {
//       const msg = await response.text();
//       throw new Error(msg || "Error en la transcripción");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("❌ Error en sendVoiceCommand:", error);
//     throw error;
//   }
// }
export async function sendVoiceCommand(audioBlob) {
  const formData = new FormData();
  formData.append("audio", audioBlob, `voice-${Date.now()}.webm`);

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/apiChat/ai/voice`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    console.log("✅ Respuesta backend:", data);
    return data;
  } catch (error) {
    console.error("❌ Error en sendVoiceCommand:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
}
/**
 * Ejemplo de endpoint adicional: obtener estado del bot o IA
 * (útil si en el futuro querés mostrar “sistema listo / ocupado”)
 */
export async function getAiStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/apiChat/ai/status`);
    if (!response.ok) throw new Error("Error al obtener estado de la IA");
    return await response.json();
  } catch (error) {
    console.error("❌ Error en getAiStatus:", error);
    return { status: "offline" };
  }
}
