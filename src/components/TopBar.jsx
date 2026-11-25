import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/TopBar.css";

export default function TopBar({ secciones, actual, onCambiarSeccion, categorias, zonas, filtros, onFiltrar, onNuevo }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [nombre, setNombre] = useState(filtros.nombre);
  const [categoria, setCategoria] = useState(filtros.categoria);
  const [zona, setZona] = useState(filtros.zona);
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const esAdmin = usuario?.rol === "administrador";
  const iniciales = usuario?.nombre ? usuario.nombre.slice(0, 2).toUpperCase() : "?";

  function elegir(id) {
    onCambiarSeccion(id);
    setMenuAbierto(false);
  }

  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  }

  function buscar(e) {
    e.preventDefault();
    onFiltrar({ nombre: nombre.trim(), categoria, zona });
  }

  function limpiar() {
    setNombre("");
    setCategoria("");
    setZona("");
    onFiltrar({ nombre: "", categoria: "", zona: "" });
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

      <form className="topbar-filtros" onSubmit={buscar}>
        <input
          type="search"
          placeholder="Nombre de la ubicación"
          aria-label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <select aria-label="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Categoría: todas</option>
          {categorias.map((c) => (
            <option key={c._id} value={c._id}>{c.nombre}</option>
          ))}
        </select>
        <select aria-label="Zona" value={zona} onChange={(e) => setZona(e.target.value)}>
          <option value="">Zona: todas</option>
          {zonas.map((z) => (
            <option key={z._id} value={z._id}>{z.nombre}</option>
          ))}
        </select>
        <button type="submit" className="btn-primario">Buscar</button>
        <button type="button" className="btn-secundario" onClick={limpiar}>Limpiar</button>
      </form>

      {actual.nuevo && (
        <button type="button" className="btn-secundario" onClick={onNuevo}>+ {actual.nuevo}</button>
      )}
      <span className="topbar-avatar" title={usuario?.nombre ?? "Usuario"}>{iniciales}</span>
    </header>
  );
}
