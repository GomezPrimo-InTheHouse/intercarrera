import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function LoginForm() {
  const { loginWithRedirect, isLoading } = useAuth0();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Auth0 maneja el login completo (no valida localmente email/pass)
    await loginWithRedirect({
      appState: { returnTo: "/dashboard" },
      authorizationParams: {
        login_hint: email, // sugerencia para Auth0
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#212121] text-[#D8D8D8] w-full max-w-sm p-8 rounded-2xl shadow-2xl flex flex-col gap-6"
    >
      <h2 className="text-3xl font-bold text-center mb-2 text-[#D7BFA8]">
        Iniciar sesión
      </h2>
      <p className="text-sm text-center text-[#979590] mb-4">
        Ingresa tus credenciales para acceder al sistema
      </p>

      {/* Campo email */}
      <div className="flex flex-col">
        <label className="text-sm mb-1 text-[#D8D8D8]">Correo electrónico</label>
        <input
          type="email"
          placeholder="ejemplo@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[#2E2E2E] text-[#D8D8D8] border border-[#5C7A8B] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D7BFA8]"
          required
        />
      </div>

      {/* Campo contraseña */}
      <div className="flex flex-col">
        <label className="text-sm mb-1 text-[#D8D8D8]">Contraseña</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-[#2E2E2E] text-[#D8D8D8] border border-[#5C7A8B] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D7BFA8]"
          required
        />
      </div>

      {/* Botón */}
      <button
        type="submit"
        disabled={isLoading}
        className="bg-[#D7BFA8] text-[#212121] font-semibold py-2 rounded-lg mt-4 hover:bg-[#c8ac91] transition-colors disabled:opacity-60"
      >
        {isLoading ? "Autenticando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
