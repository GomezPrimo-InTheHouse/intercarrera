// src/components/ui/Spinner.jsx
/* eslint-disable react/prop-types */
export default function Spinner({
  size = 40,        // px
  thickness = 4,    // px
  label = null,     // string opcional debajo del spinner
  className = "",
  ringClass = "border-gray-300",
  arcClass = "border-gray-800", // puedes cambiar a tu color de marca
}) {
  const dim = `${size}px`;
  const th = `${thickness}px`;

  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center ${className}`}>
      <div
        className="relative inline-block animate-spin rounded-full"
        style={{ width: dim, height: dim }}
        aria-hidden
      >
        {/* Anillo base */}
        <span
          className={`absolute inset-0 rounded-full border ${ringClass}`}
          style={{ borderWidth: th }}
        />
        {/* Arco animado */}
        <span
          className={`absolute inset-0 rounded-full border-t-transparent ${arcClass}`}
          style={{ borderWidth: th }}
        />
      </div>
      {label && <span className="mt-2 text-xs text-gray-700">{label}</span>}
    </div>
  );
}
