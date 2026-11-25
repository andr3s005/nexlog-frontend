import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Panel from "./pages/Panel.jsx";
import Aprobacion from "./pages/Aprobacion.jsx";
import RutaPrivada from "./components/RutaPrivada.jsx";

export default function App(){
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/panel" element={<RutaPrivada><Panel /></RutaPrivada>} />
            <Route path="/usuarios" element={<RutaPrivada soloAdmin><Aprobacion /></RutaPrivada>} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}