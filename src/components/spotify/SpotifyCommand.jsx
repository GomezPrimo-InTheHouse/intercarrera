// src/components/spotify/SpotifyCommand.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { postSpotifyComando, getSpotifyStatus } from "../../api/unifiedApi.js";

export default function SpotifyCommand() {
  const [orden, setOrden] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);     // mensajes de UI (éxito / info)
  const [err, setErr] = useState(null);     // error visible
  const lastOrderRef = useRef(null);        // para reintento tras login
  const popupRef = useRef(null);
  const retryPendingRef = useRef(false);

  // Abre popup de login y arma listener para reintento
  const openSpotifyLoginAndRetry = useCallback(async (loginUrl) => {
    try {
      // Abrimos popup centrado
      const w = 520, h = 700;
      const y = window.top.outerHeight / 2 + window.top.screenY - (h / 2);
      const x = window.top.outerWidth / 2 + window.top.screenX - (w / 2);
      popupRef.current = window.open(
        loginUrl,
        "spotify_login",
        `toolbar=no, location=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=${w}, height=${h}, top=${y}, left=${x}`
      );

      retryPendingRef.current = true;
    } catch (e) {
      setErr("No se pudo abrir el popup de Spotify. Desbloqueá popups e intentá de nuevo.");
    }
  }, []);

  // Listener para mensaje de éxito desde el popup (/callback envía SPOTIFY_AUTH_OK)
  useEffect(() => {
    function onAuthOk(ev) {
      if (ev?.data?.type === "SPOTIFY_AUTH_OK" && retryPendingRef.current) {
        retryPendingRef.current = false;
        if (popupRef.current && !popupRef.current.closed) {
          try { popupRef.current.close(); } catch {}
        }
        // Reintentar último comando
        if (lastOrderRef.current) {
          handleSend(lastOrderRef.current, /*isRetry*/ true);
        }
      }
    }
    window.addEventListener("message", onAuthOk);
    return () => window.removeEventListener("message", onAuthOk);
  }, []);

  const handleSend = useCallback(async (texto, isRetry = false) => {
    if (!texto || !texto.trim()) return;
    setLoading(true);
    setErr(null);
    if (!isRetry) setMsg(null);
    lastOrderRef.current = texto;

    try {
      const data = await postSpotifyComando(texto.trim());
      // éxito
      const base = data?.mensaje || "Comando ejecutado.";
      const extra = data?.track
        ? ` 🎵 ${data.track.name} · ${data.track.artists?.map(a => a.name).join(", ")}`
        : "";
      setMsg(base + extra);
    } catch (e) {
      // 401: falta auth → abrir login y reintentar luego
      if (e.status === 401 && e.data?.loginUrl) {
        setMsg("Necesitamos que te autentiques con Spotify…");
        await openSpotifyLoginAndRetry(e.data.loginUrl);
      } else if (e.status === 412) {
        // No hay dispositivo activo
        setErr(e.message || "No se detecta un dispositivo activo en Spotify.");
      } else if (e.status === 404) {
        setErr(e.message || "No se encontró la canción.");
      } else if (e.status === 400) {
        setErr(e.data?.error || "Comando no soportado. Probá: 'Reproducí <tema> de <artista>'.");
      } else {
        setErr(e.message || "Error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  }, [openSpotifyLoginAndRetry]);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSend(orden);
  };

  return (
    <div className="w-full bg-neutral-900/60 border border-white/10 rounded-2xl p-4 sm:p-5">
      <form onSubmit={onSubmit} className="flex gap-2 items-center">
        <input
          className="flex-1 rounded-xl bg-white-800/80 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/60"
          type="text"
          placeholder="Ej: reproducí Bohemian Rhapsody de Queen"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !orden.trim()}
          className="rounded-xl px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition"
        >
          {loading ? "Enviando…" : "Enviar"}
        </button>
      </form>

      {msg && (
        <p className="mt-3 text-sm text-green-400">{msg}</p>
      )}
      {err && (
        <p className="mt-3 text-sm text-red-400">{err}</p>
      )}

      {/* Atajo de pruebas rápidas (opcional) */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => handleSend("reproducí Imagine Dragons Believer")}
          className="text-xs rounded-lg px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-white/10"
          disabled={loading}
        >
          Probar: Believer – Imagine Dragons
        </button>
        <button
          onClick={async () => {
            // pequeño helper: si no está logueado, abre login manual
            const st = await getSpotifyStatus();
            if (!st.authenticated && st.loginUrl) openSpotifyLoginAndRetry(st.loginUrl);
          }}
          className="text-xs rounded-lg px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-white/10"
          disabled={loading}
        >
          Conectar Spotify
        </button>
      </div>
    </div>
  );
}
