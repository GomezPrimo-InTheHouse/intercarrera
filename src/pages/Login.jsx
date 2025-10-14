import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import FloatingBot from "../components/bot/FloatingBot";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#D8D8D8]">
        <div className="w-10 h-10 border-4 border-[#5C7A8B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <p>Error al iniciar sesión: {error.message}</p>
      </div>
    );
  }
  
  const handleLogin = async () => {
  try {
    await loginWithRedirect({
      appState: { returnTo: "/dashboard" },
      screen_hint: "login",
    });
  } catch (e) {
    console.error("Error al intentar loguearse:", e);
  }
};


  return (
    <div
      className="flex h-screen w-full flex-col md:flex-row bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('/src/assets/login-bg.png')",
      }}
    >
      {/* Overlay para móviles */}
      <div className="absolute inset-0 bg-[#5C7A8B]/60 md:hidden" />

      {/* Panel Izquierdo */}
      <div className="hidden md:flex md:w-[30%] bg-[#5C7A8B]/80 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{ backgroundImage: "url('/src/assets/login-bg.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-[#5C7A8B]/60"></div>

        {/* Robot animado */}
        <FloatingBot />

        <div className="relative z-10 flex flex-col justify-center items-center px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Bienvenido</h1>
          <p className="text-[#D8D8D8] max-w-sm">
            Gestioná tus datos con seguridad e inteligencia.
          </p>
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="flex flex-1 justify-center items-center px-6 md:px-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-[#E5E5E5]"
        >
          <h2 className="text-3xl font-semibold text-[#212121] text-center mb-2">
            Iniciar sesión
          </h2>
          <p className="text-center text-[#979590] mb-6">
            Accedé con tu cuenta segura
          </p>

          <button
            onClick={() =>
              loginWithRedirect({
                appState: { returnTo: "/dashboard" },
              })
            }
            className="w-full py-3 bg-[#5C7A8B] text-white font-semibold rounded-xl hover:bg-[#4c6977] transition-all duration-300 shadow-sm"
          >
            Iniciar sesión con Auth0
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#979590]">
              ¿No tenés cuenta?{" "}
              <button
                onClick={() =>
                  loginWithRedirect({
                    screen_hint: "signup",
                    appState: { returnTo: "/dashboard" },
                  })
                }
                className="text-[#5C7A8B] font-semibold hover:underline"
              >
                Registrate aquí
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
