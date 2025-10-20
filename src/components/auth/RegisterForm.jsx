// src/components/auth/RegisterForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../Services/AuthService.js";

import { useNotify } from "../../context/NotifyContext.jsx";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { notify } = useNotify();

  const [nombre, setNombre] = useState("");
  const [email, setEmail]   = useState("");
  const [password, setPassword] = useState("");


  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // TOTP
  const [userId, setUserId] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [base32, setBase32] = useState(null);

  // Verificación TOTP
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const onRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      const res = await AuthService.register({ nombre, email, password });
      const uid = res?.user?.id || res?.id;
      if (!uid) throw new Error("No se obtuvo el id de usuario");
      setUserId(uid);
      setQrDataUrl(res.qrCodeDataURL || null);
      setBase32(res.base32 || null);
      setMsg("🔐 Escaneá el QR con tu app autenticadora. Luego ingresá el código para verificar.");
      notify({
        type: "success",
        title: "Usuario creado",
        message: "Escaneá el QR para activar tu 2FA.",
        duration: 3000,
      });
    } catch (err) {
      const apiMsg = err?.response?.data?.error || err.message || "Error al registrar";
      setMsg("❌ " + apiMsg);
      notify({ type: "error", title: "Registro fallido", message: apiMsg, duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const onVerifyTotp = async (e) => {
    e.preventDefault();
    if (!userId) return;

    setVerifying(true); setMsg("");
    try {
      await AuthService.totpVerify({ userId, code: verifyCode });
      setVerified(true);
      setMsg("✅ 2FA habilitado correctamente. Redirigiendo al login…");

      // Notificación + redirección automática
      notify({
        type: "success",
        title: "2FA verificado",
        message: "Te estamos llevando al login…",
        duration: 1800,
      });

      // Pequeña espera para que el usuario lea la notificación
      setTimeout(() => navigate("/login", { replace: true }), 1600);
    } catch (err) {
      const apiMsg = err?.response?.data?.error || err.message || "No se pudo verificar el TOTP";
      setMsg("❌ " + apiMsg);
      notify({ type: "error", title: "TOTP inválido", message: apiMsg, duration: 3500 });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      {!userId && (
        <form onSubmit={onRegister} className="space-y-3">
          <input
            type="text"
            placeholder="Nombre completo"
            className="w-full py-3 px-4 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C7A8B]"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full py-3 px-4 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C7A8B]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full py-3 px-4 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C7A8B]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* <select
            className="w-full py-3 px-4 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C7A8B]"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
          >
            <option value="usuario">Usuario</option>
            <option value="admin">Admin</option>
          </select> */}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#5C7A8B] text-white font-semibold rounded-xl hover:bg-[#4c6977] transition-all duration-300 shadow-sm"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      )}

      {userId && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-[#979590]">
              Escaneá el QR con Google Authenticator / Authy.
            </p>
          </div>

          {qrDataUrl && (
            <div className="flex justify-center">
              <img
                src={qrDataUrl}
                alt="QR TOTP"
                className="w-56 h-56 rounded-xl border border-[#E5E5E5] shadow-sm"
              />
            </div>
          )}

          {base32 && (
            <p className="text-center text-sm text-[#979590]">
              Clave manual: <span className="font-mono">{base32}</span>
            </p>
          )}

          {!verified && (
            <form onSubmit={onVerifyTotp} className="space-y-3">
              <input
                type="text"
                placeholder="Ingresá el código TOTP"
                className="w-full py-3 px-4 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C7A8B]"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3 bg-[#5C7A8B] text-white font-semibold rounded-xl hover:bg-[#4c6977] transition-all duration-300 shadow-sm"
              >
                {verifying ? "Verificando..." : "Verificar 2FA"}
              </button>
            </form>
          )}

          {verified && (
            <p className="text-center text-[#5C7A8B] font-semibold">
              ¡Listo! Ahora te llevamos al login…
            </p>
          )}

          {msg && <p className="mt-2 text-center text-[#979590]">{msg}</p>}
        </div>
      )}

      {msg && !userId && <p className="mt-4 text-center text-[#979590]">{msg}</p>}
    </>
  );
}
