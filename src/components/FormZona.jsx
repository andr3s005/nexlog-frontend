import { useState } from "react";

export default function FormZona({ centros, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [centroId, setCentroId] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function manejarEnvio(e) {
    e.preventDefault();

    if (nombre.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (descripcion.trim().length < 2) {
      setError("Escribe una descripción.");
      return;
    }
    if (!centroId) {
      setError("Elige el centro al que pertenece.");
      return;
    }

    setError("");
    setGuardando(true);
    try {
      await onGuardar({ nombre: nombre.trim(), descripcion: descripcion.trim(), centroId });
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  }

  return (
    <form className="form-popup" onSubmit={manejarEnvio}>
      <strong>Nueva zona</strong>

      <label htmlFor="zona-nombre">Nombre</label>
      <input id="zona-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />

      <label htmlFor="zona-descripcion">Descripción</label>
      <input id="zona-descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />

      <label htmlFor="zona-centro">Centro</label>
      <select id="zona-centro" value={centroId} onChange={(e) => setCentroId(e.target.value)}>
        <option value="">Elige un centro</option>
        {centros.map((c) => (
          <option key={c._id} value={c._id}>{c.nombre}</option>
        ))}
      </select>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-acciones">
        <button type="submit" className="btn-primario" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" className="btn-secundario" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
