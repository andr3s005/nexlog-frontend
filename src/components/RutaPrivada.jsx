import { Navigate } from "react-router-dom";

export default function RutaPrivada({ children, soloAdmin = false }) {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  if(!token) return <Navigate to="/" replace />;
  if(soloAdmin && usuario?.rol !== "administrador") return <Navigate to="/panel" replace />

  return children;
}