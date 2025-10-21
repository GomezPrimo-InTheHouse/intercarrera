import { motion } from "framer-motion";

export default function Interaccion() {
  return (
    <motion.div
      className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-2xl p-6 shadow-lg text-center hover:scale-105 transition-transform">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Modo Autónomo</h2>
        <p className="text-gray-600">Permite que el robot se mueva y responda automáticamente a los estímulos.</p>
      </div>

      <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-2xl p-6 shadow-lg text-center hover:scale-105 transition-transform">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Interacción por Voz</h2>
        <p className="text-gray-600">El robot reconoce comandos hablados para una experiencia más natural.</p>
      </div>

      <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-2xl p-6 shadow-lg text-center hover:scale-105 transition-transform">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Gestos</h2>
        <p className="text-gray-600">Responde a movimientos detectados por cámara o sensores de proximidad.</p>
      </div>
    </motion.div>
  );
}
