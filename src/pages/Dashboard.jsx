import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthService from "../Services/AuthService.js";
import { useNotify } from "../context/NotifyContext.jsx";

import ConfirmModal from "../components/ui/ConfirmModal.jsx";

import ButtonsControllers from "../components/sidebar/ButtonsControllers.jsx";
import ButtonControllerWithVisualizer from "../components/sidebar/ButtonControllerConrobot.jsx";
import Sensores from "../components/sidebar/Sensores.jsx";
import Interaction from "../components/sidebar/Interaction.jsx";

// Config declarativa de secciones (id + label + componente)
const SECTIONS = [
  { id: "interaccion", label: "Interacción", component: Interaction },
  { id: "sensores", label: "Sensores", component: Sensores },
  { id: "controles", label: "Controles", component: ButtonControllerWithVisualizer },
];

export default function Dashboard() {
  // default en "interaccion"
  const [selected, setSelected] = useState("interaccion");

  const { notify } = useNotify();
  const navigate = useNavigate();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const CurrentView =
    SECTIONS.find((s) => s.id === selected)?.component ?? ButtonsControllers;

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      notify({
        type: "success",
        title: "Sesión cerrada",
        message: "Hasta luego 👋",
        duration: 1500,
      });
      setOpenConfirm(false);
      navigate("/login", { replace: true });
      setTimeout(() => {
        if (location.pathname !== "/login") window.location.href = "/login";
      }, 150);
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
      setOpenConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6F7]">
      {/* SIDEBAR 30% */}
      <aside className="hidden md:flex md:w-[30%] relative text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/src/assets/login-bg.png')" }}
        />
        <div className="absolute inset-0 bg-[#5C7A8B]/70" />
        <div className="relative z-10 flex flex-col justify-between p-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Panel</h2>
          </div>

          {/* Botones a partir de la config (orden: Interacción, Sensores, Controles) */}
          <div className="mt-6 space-y-3">
            {SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  selected === id
                    ? "bg-white/30 font-semibold"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setOpenConfirm(true)}
            className="mt-8 w-full bg-white text-[#212121] font-semibold py-2 rounded-lg hover:bg-[#D8D8D8] transition"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN 70% */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#212121]">
              Dashboard
            </h1>
            <p className="text-[#979590]">Resumen general</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#E5E5E5] bg-white/60" />
          </div>
        </div>

        {/* CONTENIDO: SOLO el componente seleccionado */}
        {/* Contenedor neutro: NO forzamos fondo ni card para no romper estilos internos */}
        <div className="min-h-[60vh]">
          <CurrentView />
        </div>
      </main>

      {/* Modal de confirmación */}
      <ConfirmModal
        open={openConfirm}
        title="¿Seguro que querés cerrar sesión?"
        description="Se cerrará tu sesión actual."
        confirmText={loading ? "Saliendo..." : "Sí"}
        cancelText="No"
        onConfirm={handleLogout}
        onCancel={() => setOpenConfirm(false)}
      />
    </div>
  );
}
