// src/components/auth0/Auth0.jsx
import { useEffect, useState } from "react";
import Auth0Lock from "auth0-lock";
import { useAuth0 } from "@auth0/auth0-react";

export default function Auth0Login() {
  const { isAuthenticated, logout, user } = useAuth0();
  const [lock, setLock] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      const auth0Lock = new Auth0Lock(
        "NRPkoycQqjiyxn6ArdcHiGK5buQ0VeWR",        
        "dev-gesg3r4ddoxwmwwt.us.auth0.com", 
        {
          auth: {
            redirect: false,
            responseType: "token id_token",
            sso: false,
          },
          theme: {
            logo: "/robot-login.jpeg", // Logo en public/
            primaryColor: "#0f172a",
          },
          languageDictionary: {
            title: "Iniciar sesión",
          },
        }
      );

      setLock(auth0Lock);
      auth0Lock.show();
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return (
      <div className="w-1/2 flex flex-col justify-center items-center bg-gray-900 text-white p-8">
        <img
          src={user.picture}
          alt={user.name}
          className="w-24 h-24 rounded-full mb-4 shadow-lg"
        />
        <h2 className="text-2xl font-semibold mb-2">Hola, {user.name} 👋</h2>
        <p className="text-gray-400 mb-6">{user.email}</p>
        <button
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
          className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  // Panel vacío mientras se muestra el login embebido
  return <div className="w-1/2 flex justify-center items-center bg-gray-900 p-8"></div>;
}
