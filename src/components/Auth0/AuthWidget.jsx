import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function AuthWidget() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    } else {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect, navigate]);

  return (
    <div className="w-full max-w-sm text-center">
      <div className="w-12 h-12 border-4 border-[#D7BFA8] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <h2 className="text-2xl font-semibold text-[#D8D8D8]">Redirigiendo al sistema de autenticación...</h2>
      <p className="text-[#979590] mt-2">Por favor espera un momento</p>
    </div>
  );
}
