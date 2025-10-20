import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Battery, Thermometer, Sun, Ruler } from "lucide-react";

export default function Sensores() {
  const [sensores, setSensores] = useState(null);

  // Simula carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setSensores({
        temperatura: 25,
        distancia: 120,
        luz: 70,
        bateria: 88,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Actualiza datos cada 3 segundos
  useEffect(() => {
    if (!sensores) return;
    const interval = setInterval(() => {
      setSensores({
        temperatura: (20 + Math.random() * 10).toFixed(1),
        distancia: (100 + Math.random() * 50).toFixed(0),
        luz: (50 + Math.random() * 50).toFixed(0),
        bateria: (70 + Math.random() * 30).toFixed(0),
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [sensores]);

  // Loader inicial
  if (!sensores) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-[#F5F7FA] text-[#5C7A8B]">
        <div className="w-14 h-14 border-4 border-[#5C7A8B] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium">Cargando sensores...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="p-8 flex flex-col items-center w-full h-full bg-[#F5F7FA] rounded-2xl shadow-inner"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <motion.h2
        className="text-3xl font-semibold text-[#212121] mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Sensores del Robot
      </motion.h2>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        {/* Tarjetas animadas */}
        <SensorCard
          icon={<Thermometer className="text-[#FFB74D]" size={28} />}
          label="Temperatura"
          value={`${sensores.temperatura}°C`}
          bgColor="bg-[#FFB74D]/20"
        />
        <SensorCard
          icon={<Ruler className="text-[#64B5F6]" size={28} />}
          label="Distancia"
          value={`${sensores.distancia} cm`}
          bgColor="bg-[#64B5F6]/20"
        />
        <SensorCard
          icon={<Sun className="text-[#FFD54F]" size={28} />}
          label="Nivel de Luz"
          value={`${sensores.luz}%`}
          bgColor="bg-[#FFD54F]/20"
        />
        <SensorCard
          icon={<Battery className="text-[#81C784]" size={28} />}
          label="Batería"
          value={`${sensores.bateria}%`}
          bgColor="bg-[#81C784]/20"
        />
      </motion.div>
    </motion.div>
  );
}

// Subcomponente animado
function SensorCard({ icon, label, value, bgColor }) {
  return (
    <motion.div
      className="flex items-center justify-between bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300"
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 ${bgColor} rounded-full`}>{icon}</div>
        <div>
          <p className="text-[#777] text-sm">{label}</p>
          <p className="text-2xl font-semibold text-[#333]">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
