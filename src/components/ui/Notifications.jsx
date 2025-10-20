import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Colores/estilos por tipo
const styleByType = {
  success: "border-l-4 border-green-500",
  error:   "border-l-4 border-red-500",
  info:    "border-l-4 border-blue-500",
  warning: "border-l-4 border-yellow-500",
};

export default function Notifications({ toasts, onClose }) {
  return (
    <div className="fixed top-4 right-4 z-[1000] space-y-3 w-[calc(100%-2rem)] max-w-sm">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => onClose(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast, onClose }) {
  const { id, title, message, type = "info", duration = 3000, action } = toast;

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`bg-white/95 backdrop-blur-md shadow-xl rounded-xl p-4 border border-[#E5E5E5] ${styleByType[type]}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && <h4 className="text-[#212121] font-semibold">{title}</h4>}
          {message && <p className="text-sm text-[#6b7280] mt-0.5">{message}</p>}
          {action?.label && action?.onClick && (
            <button
              onClick={action.onClick}
              className="mt-3 px-3 py-1.5 text-sm rounded-lg border border-[#E5E5E5] hover:bg-[#F5F5F5] transition"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[#6b7280] hover:text-[#111827] transition p-1"
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}
