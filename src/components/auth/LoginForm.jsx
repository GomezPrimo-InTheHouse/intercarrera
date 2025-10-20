// src/components/auth/LoginForm.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/UseAuth";
import { useNotify } from "../../context/NotifyContext.jsx";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState(""); // opcional si el usuario tiene 2FA
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const { notify } = useNotify();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      await login({ email, password, totp: totp || undefined });
      // tras await login(...)
      
      notify({
        type: "success",
        title: "Usuario autenticado correctamente",
        message: "ingresando al dashboard ...",
        duration: 4000,
      });
      navigate(from, { replace: true });
    } catch (err) {
      const apiMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Error al iniciar sesión";
      setMsg("❌ " + apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
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

      <input
        type="text"
        placeholder="Código TOTP (si corresponde)"
        className="w-full py-3 px-4 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C7A8B]"
        value={totp}
        onChange={(e) => setTotp(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#5C7A8B] text-white font-semibold rounded-xl hover:bg-[#4c6977] transition-all duration-300 shadow-sm"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      {msg && <p className="text-center text-[#979590]">{msg}</p>}
    </form>
  );
}
