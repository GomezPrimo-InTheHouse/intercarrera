import axios from "axios";
// import.meta.env.VITE_API_URL_V2 || 
const api = axios.create({
    baseURL: "http://localhost:3002",
    timeout: 8000,
    });

// **
//  * Enviar comando al robot
//  * @param {string} action - avanzar | frenar | izquierda | derecha | girar
//  * @param {string} robotId - UUID del robot (opcional)
//  */

export async function sendRobotAction(action, robotId = null) {
  try {
    const payload = { type: "action", action };
    if (robotId) payload.robot_id = robotId;

    const { data } = await api.post("/api/mqtt/control", payload);
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

    const { data } = await api.post("/api/mqtt/control", payload);
    return data;
  } catch (error) {
    console.error("[sendRobotTitle] error:", error);
    throw error.response?.data || error;
  }
}

/**
 * Opcional: Endpoint de salud para verificar si el backend está corriendo
 */
export async function checkBackendHealth() {
  try {
    const { data } = await api.get("/health");
    return data;
  } catch (error) {
    console.error("[checkBackendHealth] error:", error);
    return { ok: false };
  }
}