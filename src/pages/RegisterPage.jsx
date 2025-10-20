import { motion } from "framer-motion";
import RegisterForm from "../components/auth/RegisterForm";
import { Link } from "react-router-dom";
export default function RegisterPage() {
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
          <h1 className="text-4xl font-bold mb-4">Crear cuenta</h1>
          <p className="text-[#D8D8D8] max-w-sm">
            Activá tu 2FA y protegé tu acceso.
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
            Registrarse
          </h2>
          <p className="text-center text-[#979590] mb-6">
            Ingresá tus datos y configurá tu 2FA
          </p>

          <RegisterForm />
                    <div className="mt-6 text-center">
            <p className="text-sm text-[#979590]">
              ¿Ya tenés una cuenta en Nexa?{" "}
              <Link to="/login" className="text-[#5C7A8B] font-semibold hover:underline">
                 Ingresa aquí
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
