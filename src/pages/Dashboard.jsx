import { useAuth0 } from "@auth0/auth0-react";

export default function Dashboard() {
    const { user, logout } = useAuth0();


    return (
        <div className="flex h-screen w-full bg-[#F5F6F7]">
            {/* Sidebar 30% */}
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
                    <div className="mt-6 space-y-3">
                        <button className="w-full text-left px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                            Resumen
                        </button>
                        <button className="w-full text-left px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                            Actividad
                        </button>
                        <button className="w-full text-left px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                            Configuración
                        </button>
                    </div>
                    <button
                        onClick={() =>
                            logout({
                                logoutParams: {
                                    returnTo: "http://localhost:5174/login", // ✅ debe coincidir con Allowed Logout URLs
                                },
                            })
                        }
                        className="mt-8 w-full bg-white text-[#212121] font-semibold py-2 rounded-lg hover:bg-[#D8D8D8] transition"
                    >
                        Cerrar sesión
                    </button>;
                </div>
            </aside>

            {/* Main 70% */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#212121]">
                            Dashboard
                        </h1>
                        <p className="text-[#979590]">
                            Resumen general de tu cuenta
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img
                            src={user?.picture}
                            alt="avatar"
                            className="w-10 h-10 rounded-full border border-[#E5E5E5]"
                        />
                        <div className="hidden sm:block">
                            <p className="text-sm font-semibold text-[#212121]">{user?.name}</p>
                            <p className="text-xs text-[#979590]">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white border border-[#ECECEC] rounded-xl p-5 shadow-sm">
                        <p className="text-sm text-[#979590]">Usuarios activos</p>
                        <p className="text-3xl font-bold text-[#212121] mt-1">1,248</p>
                    </div>
                    <div className="bg-white border border-[#ECECEC] rounded-xl p-5 shadow-sm">
                        <p className="text-sm text-[#979590]">Conversiones</p>
                        <p className="text-3xl font-bold text-[#212121] mt-1">312</p>
                    </div>
                    <div className="bg-white border border-[#ECECEC] rounded-xl p-5 shadow-sm">
                        <p className="text-sm text-[#979590]">Errores</p>
                        <p className="text-3xl font-bold text-[#212121] mt-1">7</p>
                    </div>
                </section>

                {/* Tabla simple */}
                <section className="bg-white border border-[#ECECEC] rounded-xl shadow-sm">
                    <div className="p-5 border-b border-[#F1F1F1]">
                        <h3 className="text-lg font-semibold text-[#212121]">Última actividad</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-[#979590] border-b">
                                    <th className="px-5 py-3">Fecha</th>
                                    <th className="px-5 py-3">Acción</th>
                                    <th className="px-5 py-3">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="text-[#212121]">
                                <tr className="border-b">
                                    <td className="px-5 py-3">2025-10-14</td>
                                    <td className="px-5 py-3">Inicio de sesión</td>
                                    <td className="px-5 py-3">OK</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-5 py-3">2025-10-13</td>
                                    <td className="px-5 py-3">Actualizó perfil</td>
                                    <td className="px-5 py-3">OK</td>
                                </tr>
                                <tr>
                                    <td className="px-5 py-3">2025-10-12</td>
                                    <td className="px-5 py-3">Error de API</td>
                                    <td className="px-5 py-3">Revisar</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
