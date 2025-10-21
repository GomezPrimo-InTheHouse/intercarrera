import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Battery, Thermometer, Sun, Ruler } from "lucide-react";

export default function Sensores() {
  const [datos, setDatos] = useState({
    bateria: 85,
    temperatura: 28,
    luz: 65,
    distancia: 120,
  });

  useEffect(() => {
    const intervalo = setInterval(() => {
      setDatos({
        bateria: Math.max(0, Math.min(100, datos.bateria + (Math.random() - 0.5) * 3)),
        temperatura: Math.max(15, Math.min(35, datos.temperatura + (Math.random() - 0.5) * 1)),
        luz: Math.max(0, Math.min(100, datos.luz + (Math.random() - 0.5) * 5)),
        distancia: Math.max(0, Math.min(200, datos.distancia + (Math.random() - 0.5) * 10)),
      });
    }, 2000);
    return () => clearInterval(intervalo);
  }, [datos]);

  const cards = [
    { icon: <Battery size={28} />, label: "Batería", value: `${datos.bateria.toFixed(0)}%` },
    { icon: <Thermometer size={28} />, label: "Temperatura", value: `${datos.temperatura.toFixed(1)} °C` },
    { icon: <Sun size={28} />, label: "Luz", value: `${datos.luz.toFixed(0)}%` },
    { icon: <Ruler size={28} />, label: "Distancia", value: `${datos.distancia.toFixed(1)} cm` },
  ];

  return (
    <motion.div
      className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          className="backdrop-blur-md bg-white/40 border border-white/20 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform"
        >
          <div className="text-gray-800 mb-2">{card.icon}</div>
          <h3 className="text-lg font-semibold text-gray-800">{card.label}</h3>
          <p className="text-gray-600 text-sm mt-1">{card.value}</p>
        </div>
      ))}
    </motion.div>
  );
}
