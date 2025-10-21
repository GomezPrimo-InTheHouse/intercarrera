import { useState } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function ControlesRobot() {
  const [activo, setActivo] = useState(false);

  const handleCentralClick = () => {
    setActivo(!activo);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center h-full"
    >
      <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
        {/* Botón hacia arriba */}
        <button className="control-btn">
          <ArrowUp size={22} />
        </button>

        {/* Fila del medio */}
        <div className="flex space-x-6">
          <button className="control-btn">
            <ArrowLeft size={22} />
          </button>

          {/* Botón central */}
          <button
            onClick={handleCentralClick}
            className={`control-btn transition-all ${
              activo ? "bg-green-500 hover:bg-green-600" : "bg-red-400 hover:bg-red-500"
            }`}
          >
            {activo ? <Play size={22} /> : <Square size={22} />}
          </button>

          <button className="control-btn">
            <ArrowRight size={22} />
          </button>
        </div>

        {/* Botón hacia abajo */}
        <button className="control-btn">
          <ArrowDown size={22} />
        </button>
      </div>

      <style>
        {`
          .control-btn {
            background-color: white;
            color: #1f2937; /* gris oscuro */
            border-radius: 9999px;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            transition: all 0.25s ease;
          }

          .control-btn:hover {
            transform: scale(1.08);
            background-color: rgba(255, 255, 255, 0.9);
            box-shadow: 0 6px 14px rgba(0,0,0,0.15);
          }
        `}
      </style>
    </motion.div>
  );
}
