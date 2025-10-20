import { Navigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useNotify } from "../context/NotifyContext";
import useAuth from "../hooks/UseAuth";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#D8D8D8]">
        <div className="w-10 h-10 border-4 border-[#5C7A8B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div
      className="flex h-screen w-full flex-col md:flex-row bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/src/assets/login-bg.png')" }}
    >
      <div className="absolute inset-0 bg-[#5C7A8B]/60 md:hidden" />

      <div className="hidden md:flex md:w-[30%] bg-[#5C7A8B]/80 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{ backgroundImage: "url('/src/assets/login-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-[#5C7A8B]/60" />
        <div className="relative z-10 flex flex-col justify-center items-center px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Bienvenido</h1>
          <p className="text-[#D8D8D8] max-w-sm">
            Gestioná tus datos con seguridad e inteligencia.
          </p>
        </div>
      </div>

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
          <p className="text-center text-[#979590] mb-6">Accedé con tu cuenta segura</p>

          {/* 🔁 Reemplazo de los botones de Auth0 por tu formulario propio */}
          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-[#979590]">
              ¿No tenés cuenta?{" "}
              <Link to="/register" className="text-[#5C7A8B] font-semibold hover:underline">
                Registrate aquí
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
