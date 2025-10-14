import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated, logout, user } = useAuth0();

  return (
    <div className="flex items-center gap-3">
      {!isAuthenticated ? (
        <button
          onClick={() => loginWithRedirect()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Iniciar sesión
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <img src={user.picture} alt="avatar" className="w-8 h-8 rounded-full border" />
          <span className="text-sm">{user.name}</span>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800 transition"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginButton;
