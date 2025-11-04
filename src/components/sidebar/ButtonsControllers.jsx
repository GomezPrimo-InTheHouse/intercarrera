// src/components/sidebar/ButtonsControllers.jsx
import { useState } from "react";
import { sendRobotAction } from "../../api/unifiedApi.js";

// 👆 Asegúrate de que el path coincida con tu estructura exacta (usa apiConnection.js o connectionApi.jsx según tu carpeta)



export default function ButtonsControllers() {
  const [loading, setLoading] = useState(false);

  // 🧠 UUID del robot (podés pasarlo como prop si querés hacerlo dinámico)
  const robotId = "848cde0f-466c-41e3-b20c-16b92b99b0d8";

  // Función genérica para enviar comandos
  const handleCommand = async (action) => {
    try {
      setLoading(true);
      console.log(`➡️ Enviando comando: ${action}`);
      const response = await sendRobotAction(action, robotId);
      console.log("✅ Respuesta del backend:", response);
    } catch (error) {
      console.error("❌ Error enviando comando:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <h2 className="text-2xl font-semibold text-[#212121] mb-6">
        Controles del Robot
      </h2>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 place-items-center">
        {/* Fila 1: avanzar */}
        <div />
        <button
          onClick={() => handleCommand("avanzar")}
          disabled={loading}
          aria-label="Avanzar"
          title="Avanzar"
          className={[
            "aspect-square w-16 sm:w-20",
            "rounded-2xl bg-[#5C7A8B] text-white",
            "text-2xl sm:text-3xl font-semibold",
            "shadow-[0_6px_18px_rgba(0,0,0,0.25)] ring-1 ring-white/10",
            "transition-all duration-150",
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.28)] hover:bg-[#4C6977] active:scale-95",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D7BFA8]/40"
          ].join(" ")}
        >
          ↑
        </button>
        <div />

        {/* Fila 2: izquierda / frenar / derecha */}
        <button
          onClick={() => handleCommand("izquierda")}
          disabled={loading}
          aria-label="Izquierda"
          title="Izquierda"
          className={[
            "aspect-square w-16 sm:w-20",
            "rounded-2xl bg-[#5C7A8B] text-white",
            "text-2xl sm:text-3xl font-semibold",
            "shadow-[0_6px_18px_rgba(0,0,0,0.25)] ring-1 ring-white/10",
            "transition-all duration-150",
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.28)] hover:bg-[#4C6977] active:scale-95",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D7BFA8]/40"
          ].join(" ")}
        >
          ←
        </button>

        <button
          onClick={() => handleCommand("frenar")}
          disabled={loading}
          aria-label="Frenar"
          title="Frenar"
          className={[
            "aspect-square w-16 sm:w-20",
            "rounded-2xl text-[#212121]",
            "text-2xl sm:text-3xl font-semibold",
            "shadow-[0_6px_18px_rgba(0,0,0,0.25)] ring-1 ring-white/10",
            "transition-all duration-150",
            "bg-[#A3B7C1] hover:bg-[#B0C3CB]",
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.28)] active:scale-95",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D7BFA8]/40"
          ].join(" ")}
        >
          ●
        </button>

        <button
          onClick={() => handleCommand("derecha")}
          disabled={loading}
          aria-label="Derecha"
          title="Derecha"
          className={[
            "aspect-square w-16 sm:w-20",
            "rounded-2xl bg-[#5C7A8B] text-white",
            "text-2xl sm:text-3xl font-semibold",
            "shadow-[0_6px_18px_rgba(0,0,0,0.25)] ring-1 ring-white/10",
            "transition-all duration-150",
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.28)] hover:bg-[#4C6977] active:scale-95",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D7BFA8]/40"
          ].join(" ")}
        >
          →
        </button>

        {/* Fila 3: girar (atrás) */}
        <div />
        <button
          onClick={() => handleCommand("girar")}
          disabled={loading}
          aria-label="Girar"
          title="Girar"
          className={[
            "aspect-square w-16 sm:w-20",
            "rounded-2xl bg-[#5C7A8B] text-white",
            "text-2xl sm:text-3xl font-semibold",
            "shadow-[0_6px_18px_rgba(0,0,0,0.25)] ring-1 ring-white/10",
            "transition-all duration-150",
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.28)] hover:bg-[#4C6977] active:scale-95",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D7BFA8]/40"
          ].join(" ")}
        >
          ↓
        </button>
        <div />
      </div>



    </div>
  );
}
