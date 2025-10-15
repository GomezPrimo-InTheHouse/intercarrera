import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
  
            <Dashboard />
         
        }  
      />

      {/* Rutas no existentes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

