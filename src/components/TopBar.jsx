import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/TopBar.css";

export default function TopBar({ secciones, actual, onCambiarSeccion, zonas }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  function elegir(id) {
    onCambiarSeccion(id);
    setMenuAbierto(false);
  }

  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const esAdmin = usuario?.rol === "administrador";
  const iniciales = usuario?.nombre ? usuario.nombre.slice(0, 2).toUpperCase() : "?";

  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  }

  return (
    <header className="topbar">
      <span className="topbar-logo">N</span>
      <span className="topbar-nombre">NexLog</span>

      <div className="topbar-menu">
        <button
          type="button"
          className="btn-secundario"
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          ☰ {actual.label}
        </button>

        {menuAbierto && (
          <nav className="topbar-desplegable" aria-label="Secciones">
            {secciones.map((s) => (
              <button
                key={s.id}
                type="button"
                className={s.id === actual.id ? "activa" : ""}
                onClick={() => elegir(s.id)}
              >
                {s.label}
              </button>
            ))}
            <hr />
            {esAdmin && <Link to="/usuarios">Aprobación de usuarios</Link>}
            <button type="button" onClick={cerrarSesion}>Cerrar sesión</button>
          </nav>
        )}
      </div>

      <form className="topbar-filtros" onSubmit={(e) => e.preventDefault()}>
        <input type="search" placeholder="Nombre de la ubicación" aria-label="Nombre" />
        <select aria-label="Categoría">
          <option value="">Categoría: todas</option>
        </select>
        <select aria-label="Zona">
          <option value="">Zona: todas</option>
          {zonas.map((zona) => (
            <option key={zona.id} value={zona.id}>{zona.nombre}</option>
          ))}
        </select>
        <button type="submit" className="btn-primario">Buscar</button>
      </form>

      <button type="button" className="btn-secundario">+ {actual.nuevo}</button>
      <span className="topbar-avatar" title={usuario?.nombre ?? "Usuario"}>{iniciales}</span>
    </header>
  );
}