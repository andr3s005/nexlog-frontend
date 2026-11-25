import { useState } from "react";

export default function FormZona({ centros, onGuardar, onCancelar }){
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [centroId, setCentroId] = useState("");
  const [error, setError] = useState("");

  function manejarEnvio(e) {
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

    onGuardar({ nombre: nombre.trim(), descripcion: descripcion.trim(), centroId });
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
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-acciones">
        <button type="submit" className="btn-primario">Guardar</button>
        <button type="button" className="btn-secundario" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}