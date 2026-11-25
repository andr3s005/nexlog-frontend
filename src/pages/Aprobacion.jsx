import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api.js";
import "../styles/Aprobacion.css";

export default function Aprobacion() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("pendiente");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [porRechazar, setPorRechazar] = useState(null);

  useEffect(() => {
    let cancelado = false;

    apiFetch("/usuarios")
      .then((datos) => {
        if (!cancelado) setUsuarios(datos);
      })
      .catch((err) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  async function cambiarEstado(usuario, estado) {
    setError("");
    try {
      const actualizado = await apiFetch(`/usuarios/${usuario._id}`, {
        method: "PATCH",
        body: JSON.stringify({ estado }),
      });
      setUsuarios((anteriores) => anteriores.map((u) => (u._id === actualizado._id ? actualizado : u)));
      setAviso(estado === "aprobado" ? `Cuenta de ${usuario.nombre} aprobada.` : `Solicitud de ${usuario.nombre} rechazada.`);
      setPorRechazar(null);
    } catch (err) {
      setError(err.message);
    }
  }

  const visibles = usuarios.filter((u) =>
    filtro === "pendiente" ? u.estado === "pendiente" : u.estado !== "pendiente"
  );
  const totalPendientes = usuarios.filter((u) => u.estado === "pendiente").length;

  return (
    <div className="aprobacion">
      <header className="topbar">
        <span className="topbar-logo">N</span>
        <span className="topbar-nombre">NexLog</span>
        <Link to="/panel" className="aprobacion-volver">← Volver al panel</Link>
      </header>

      <main className="aprobacion-contenido">
        <div className="aprobacion-encabezado">
          <div>
            <h1>Solicitudes de cuenta</h1>
            <p>Las cuentas nuevas no tienen acceso hasta que las apruebes.</p>
          </div>
          <div className="login-pestanas">
            <button type="button" className={filtro === "pendiente" ? "activa" : ""} onClick={() => setFiltro("pendiente")}>
              Pendientes ({totalPendientes})
            </button>
            <button type="button" className={filtro === "procesadas" ? "activa" : ""} onClick={() => setFiltro("procesadas")}>
              Procesadas
            </button>
          </div>
        </div>

        {aviso && <p className="mensaje mensaje-exito" role="status">{aviso}</p>}
        {error && <p className="mensaje mensaje-error" role="alert">{error}</p>}

        {cargando ? (
          <p className="lista-vacia">Cargando solicitudes…</p>
        ) : visibles.length === 0 ? (
          <p className="lista-vacia">No hay solicitudes en esta lista.</p>
        ) : (
          <div className="aprobacion-tabla">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Solicitud</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((u) => (
                  <tr key={u._id}>
                    <td>{u.nombre}</td>
                    <td>{u.correo}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString("es-MX")}</td>
                    <td><span className={`estado estado-${u.estado}`}>{u.estado}</span></td>
                    <td>
                      {u.estado === "pendiente" && porRechazar !== u._id && (
                        <div className="form-acciones">
                          <button type="button" className="btn-primario" onClick={() => cambiarEstado(u, "aprobado")}>Aprobar</button>
                          <button type="button" className="btn-secundario" onClick={() => setPorRechazar(u._id)}>Rechazar</button>
                        </div>
                      )}
                      {porRechazar === u._id && (
                        <div className="form-acciones">
                          <span>¿Rechazar?</span>
                          <button type="button" className="btn-peligro" onClick={() => cambiarEstado(u, "rechazado")}>Sí, rechazar</button>
                          <button type="button" className="btn-secundario" onClick={() => setPorRechazar(null)}>Cancelar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}