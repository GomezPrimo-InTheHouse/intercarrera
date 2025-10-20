// src/components/ui/SpinnerOverlay.jsx
/* eslint-disable react/prop-types */
import Spinner from "./Spinner";

export default function SpinnerOverlay({
  visible = false,
  label = "Procesando…",
  blur = true,
}) {
  if (!visible) return null;
  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center bg-white/60 ${blur ? "backdrop-blur-[1px]" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size={40} thickness={4} label={label} />
    </div>
  );
}
