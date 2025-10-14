import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function TestAuth0() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
        backgroundColor: "#f4f4f4",
      }}
    >
      <h1>🔐 Prueba Auth0</h1>

      {isAuthenticated ? (
        <>
          <p>Hola, {user?.name}</p>
          <button
            onClick={() =>
              logout({
                logoutParams: { returnTo: window.location.origin },
              })
            }
            style={{
              background: "#5C7A8B",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
            }}
          >
            Cerrar sesión
          </button>
        </>
      ) : (
        <button
          onClick={() =>
            loginWithRedirect({
              appState: { returnTo: "/" },
            })
          }
          style={{
            background: "#5C7A8B",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
          }}
        >
          Iniciar sesión con Auth0
        </button>
      )}
    </div>
  );
}
