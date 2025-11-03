// src/components/sidebar/ButtonsControllersDock.jsx
import { useEffect, useRef, useState } from "react";
import ButtonsControllers from "./ButtonsControllers.jsx";          // <- tu archivo ORIGINAL
import RobotVisualizer3D from "../ui/RobotVisualizer3D.jsx";     // ajusta el path si tu árbol difiere

export default function ButtonsControllersDock() {
  const hostRef = useRef(null);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const mapLabelToCmd = (raw) => {
      if (!raw) return null;
      const t = raw.trim().toLowerCase();
      // Mapeo por aria-label/title o por símbolo
      const dict = {
        "avanzar": "avanzar",
        "izquierda": "izquierda",
        "frenar": "frenar",
        "derecha": "derecha",
        "girar": "girar",
        "↑": "avanzar",
        "←": "izquierda",
        "→": "derecha",
        "↓": "girar",
        "●": "frenar",
      };
      return dict[t] || null;
    };

    const handleTap = (e) => {
      // buscamos el botón más cercano (por si se hace click en el ícono interno)
      const btn = e.target.closest("button");
      if (!btn || !host.contains(btn)) return;

      // sacamos info sin depender de props: aria-label, title o el texto (↑, ←, ●, →, ↓)
      const label =
        btn.getAttribute("aria-label") ||
        btn.getAttribute("title") ||
        btn.textContent;

      const cmd = mapLabelToCmd(label);
      if (!cmd) return;

      // 🔑 Disparamos evento para el visualizador SIEMPRE, incluso si se repite el mismo comando
      setLastEvent({ cmd, nonce: performance.now() });
      // NO prevenimos el click: tu onClick original sigue su curso y llama al backend
    };

    host.addEventListener("click", handleTap, true);     // capture = true para garantizar escucha
    host.addEventListener("touchend", handleTap, true);

    return () => {
      host.removeEventListener("click", handleTap, true);
      host.removeEventListener("touchend", handleTap, true);
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* Visualizador arriba */}
      <RobotVisualizer3D event={lastEvent} height={240} />

      {/* Tu componente original debajo (sin cambios) */}
      <div ref={hostRef}>
        <ButtonsControllers />
      </div>
    </div>
  );
}
