// src/components/ui/ConfirmModal.jsx
import { AnimatePresence, motion } from "framer-motion";

export default function ConfirmModal({
  open,
  title = "Confirmar",
  description = "¿Estás seguro?",
  confirmText = "Sí",
  cancelText = "No",
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[1001] flex items-center justify-center p-4"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
          >
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-[#E5E5E5]">
              <div className="p-6">
                <h3 id="confirm-title" className="text-lg font-semibold text-[#212121]">
                  {title}
                </h3>
                <p id="confirm-desc" className="mt-2 text-sm text-[#6b7280]">
                  {description}
                </p>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-xl border border-[#E5E5E5] text-[#212121] hover:bg-[#F5F5F5] transition"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    className="px-4 py-2 rounded-xl bg-[#5C7A8B] text-white hover:bg-[#4c6977] transition shadow-sm"
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
