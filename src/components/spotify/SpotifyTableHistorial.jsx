


/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { getLastHistorialSpotify } from "../../api/conectionApi";
import SpinnerOverlay from "../ui/SpinnerOverlay.jsx"; 
import { on } from "../../utils/eventBus";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function formatConfidence(c) {
  const n = typeof c === "string" ? parseFloat(c) : c;
  if (Number.isNaN(n)) return { label: "-", pct: 0 };
  return { label: `${(n * 100).toFixed(0)}%`, pct: Math.max(0, Math.min(100, n * 100)) };
}

function formatDateIsoToLocal(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("es-AR", {
      timeZone: "America/Argentina/Cordoba",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function SkeletonRow({ cols = 7 }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 w-full bg-gray-200 rounded" />
        </td>
      ))}
    </tr>
  );
}

function Pill({ children, tone = "neutral", title }) {
  const tones = {
    neutral: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
    success: "bg-green-100 text-green-800 ring-1 ring-green-200",
    warning: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200",
    info: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
    slate: "bg-slate-100 text-slate-800 ring-1 ring-slate-200",
  };
  return (
    <span
      className={classNames("inline-flex items-center px-2 py-0.5 text-xs rounded-full", tones[tone] || tones.neutral)}
      title={title}
    >
      {children}
    </span>
  );
}

export default function SpotifyHistorialTable({
  className = "",
  showSearch = true,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false); // ✅ estado para overlay/spinner

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setErr("");
        const res = await getLastHistorialSpotify();
        if (!res?.success) throw new Error("Respuesta no exitosa");
        const data = Array.isArray(res.data) ? res.data : [];
        if (mounted) setRows(data);
      } catch (e) {
        setErr(e?.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    fetchData();

    // Refetch al crear un nuevo historial
    const unsub = on("spotify:newHistorial", () => fetchData());

    // Spinner ON/OFF según envío
    const offPending = on("spotify:newHistorial:pending", () => setBusy(true));
    const offDone    = on("spotify:newHistorial:done",    () => setBusy(false));

    // Polling opcional cada 30s
    const interval = setInterval(fetchData, 30000);

    return () => {
      mounted = false;
      unsub();
      clearInterval(interval);
      offPending();
      offDone();
    };
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const term = q.toLowerCase();
    return rows.filter((r) => {
      const hay = [
        r.action, r.type, r.query, r.artist, r.album, r.transcript,
        r?.intent_json?.action, r?.intent_json?.query, r?.intent_json?.artist, r?.intent_json?.album
      ]
        .map((v) => (v ?? "").toString().toLowerCase())
        .some((s) => s.includes(term));
      return hay;
    });
  }, [rows, q]);

  // —— Estilos de tarjeta contenedora
  return (
    <div className={classNames("w-full", className)}>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          {/* <h2 className="text-lg font-semibold text-gray-900">Historial de comandos Spotify</h2> */}
          <div className="text-sm text-gray-600">Registros de comandos de voz enviados a Spotify</div>
        </div>
        {showSearch && (
          <div className="relative w-full md:w-80">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar acción, tipo, query, artista…"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-gray-400"
            />
            <svg
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
            >
              <path fillRule="evenodd" d="M10 2a8 8 0 015.292 13.707l4 4a1 1 0 01-1.414 1.414l-4-4A8 8 0 1110 2zm0 2a6 6 0 100 12A6 6 0 0010 4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* ✅ Overlay con spinner */}
        <SpinnerOverlay visible={busy} label="Procesando comando…" />

        {/* Contenido atenuado cuando busy */}
        <div className={busy ? "pointer-events-none select-none opacity-50" : ""}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wide sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left font-medium">Acción</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Query</th>
                  <th className="px-4 py-3 text-left font-medium">Artista</th>
                  <th className="px-4 py-3 text-left font-medium">Álbum</th>
                  <th className="px-4 py-3 text-left font-medium">Confianza</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <>
                    <SkeletonRow cols={7} />
                    <SkeletonRow cols={7} />
                    <SkeletonRow cols={7} />
                  </>
                )}

                {!loading && err && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6">
                      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                        ⚠️ {err}
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !err && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-600">
                      No hay datos para mostrar.
                    </td>
                  </tr>
                )}

                {!loading && !err && filtered.map((r, idx) => {
                  const conf = formatConfidence(r.confidence);
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={r.id}
                      className={classNames(
                        "transition-colors",
                        isEven ? "bg-white" : "bg-gray-50/60",
                        "hover:bg-gray-50"
                      )}
                    >
                      {/* Fecha */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-800">
                        {formatDateIsoToLocal(r.created_at)}
                      </td>

                      {/* Acción */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Pill tone={r.action === "play" ? "success" : r.action === "unknown" ? "warning" : "slate"}>
                          {r.action ?? "-"}
                        </Pill>
                      </td>

                      {/* Tipo */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Pill tone={r.type ? "info" : "neutral"}>{r.type ?? "-"}</Pill>
                      </td>

                      {/* Query */}
                      <td className="px-4 py-3 max-w-[22rem]">
                        <div className="truncate text-gray-900" title={r.query ?? ""}>
                          {r.query ?? "-"}
                        </div>
                        {/* Línea secundaria opcional (transcript corto) */}
                        {r.transcript && (
                          <div className="mt-0.5 text-xs text-gray-500 truncate" title={r.transcript}>
                            {r.transcript}
                          </div>
                        )}
                      </td>

                      {/* Artista */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                        {r.artist ?? "-"}
                      </td>

                      {/* Álbum */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                        {r.album ?? "-"}
                      </td>

                      {/* Confianza (barra + label) */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="relative h-2 w-24 rounded-full bg-gray-200 ring-1 ring-gray-200">
                            <div
                              className="absolute left-0 top-0 h-2 rounded-full bg-gray-800"
                              style={{ width: `${conf.pct}%` }}
                              aria-hidden
                            />
                          </div>
                          <span className="text-xs text-gray-700 tabular-nums">{conf.label}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer de estado */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-600">
            <span>{loading ? "Cargando…" : `${filtered.length} registro(s)`}{rows.length !== filtered.length ? ` (filtrado de ${rows.length})` : ""}</span>
            <span className="hidden md:inline">{busy ? "Enviando comando…" : "Actualizando en tiempo real"}</span>
          </div>
        </div>
      </div>

      {/* Mobile helper: hint */}
      <div className="mt-2 text-xs text-gray-500 md:hidden">
        Desliza horizontalmente si se ocultan columnas.
      </div>
    </div>
  );
}
