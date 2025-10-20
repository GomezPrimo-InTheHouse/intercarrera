import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import ButtonsControllers from "../components/sidebar/ButtonsControllers";
import Sensores from "../components/sidebar/Sensores";
import Interaction from "../components/sidebar/Interaction";

export default function Dashboard() {
  const { user, logout } = useAuth0();
  const [selectedSection, setSelectedSection] = useState("controles");

  const renderContent = () => {
    switch (selectedSection) {
      case "controles":
        return <ButtonsControllers />;
      case "sensores":
        return <Sensores />;
      case "interaccion":
        return <Interaction />;
      default:
        return <ButtonsControllers />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6F7]">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-[30%] relative text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/src/assets/login-bg.png')" }}
        />
        <div className="absolute inset-0 bg-[#5C7A8B]/70" />
        <div className="relative z-10 flex flex-col justify-between p-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Panel</h2>
            <p className="text-sm text-[#D8D8D8]">
              Bienvenido, {user?.given_name || user?.name || "usuario"}.
            </p>
          </div>

          {/* BOTONES DEL MENÚ */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => setSelectedSection("controles")}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                selectedSection === "controles"
                  ? "bg-white/30 font-semibold"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Controles del Robot
            </button>
            <button
              onClick={() => setSelectedSection("sensores")}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                selectedSection === "sensores"
                  ? "bg-white/30 font-semibold"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Sensores del Robot
            </button>
            <button
              onClick={() => setSelectedSection("interaccion")}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                selectedSection === "interaccion"
                  ? "bg-white/30 font-semibold"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Interacción con el Robot
            </button>
          </div>

          <button
            onClick={() =>
              logout({
                logoutParams: { returnTo: "http://localhost:5174/login" },
              })
            }
            className="mt-8 w-full bg-white text-[#212121] font-semibold py-2 rounded-lg hover:bg-[#D8D8D8] transition"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#212121]">
              Dashboard
            </h1>
            <p className="text-[#979590]">Resumen general del robot</p>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={user?.picture}
              alt="avatar"
              className="w-10 h-10 rounded-full border border-[#E5E5E5]"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-[#212121]">
                {user?.name}
              </p>
              <p className="text-xs text-[#979590]">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Render dinámico */}
        <section className="bg-white border border-[#ECECEC] rounded-xl shadow-sm p-8">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}
