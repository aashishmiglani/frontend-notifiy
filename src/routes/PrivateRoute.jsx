// src/routes/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function PrivateRoute() {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to="/" replace />;
}
