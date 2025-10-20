import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login2.jsx";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/login" element={<Login />} />
       <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
       
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
