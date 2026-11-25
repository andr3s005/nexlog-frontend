import { useState } from "react";

export default function FormNuevaUbicacion({ punto, categorias, zonas, onGuardar, onCancelar, inicial = null, zonaInicial = "", titulo = "Nueva ubicación" }) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? "");
  const [categoriaId, setCategoriaId] = useState(inicial?.categoria?._id ?? "");
  const [zonaId, setZonaId] = useState(inicial?.zona?._id ?? zonaInicial ?? "");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function manejarEnvio(e) {
    e.preventDefault();

    if (nombre.trim().length < 5) {
      setError("El nombre debe tener al menos 5 caracteres.");
      return;
    }
    if (descripcion.trim().length < 10) {
      setError("La descripción debe tener al menos 10 caracteres.");
      return;
    }
    if (!categoriaId) {
      setError("Elige una categoría.");
      return;
    }

    const datos = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categoria: categoriaId,
    };
    if (zonaId) datos.zona = zonaId;
    if (!inicial) {
      datos.ubicacion = { type: "Point", coordinates: [punto.lng, punto.lat] };
    }

    setError("");
    setGuardando(true);
    try {
      await onGuardar(datos);
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  }

  return (
    <form className="form-popup" onSubmit={manejarEnvio}>
      <strong>{titulo}</strong>
      <small>{punto.lat.toFixed(4)}, {punto.lng.toFixed(4)}</small>

      <label htmlFor="nu-nombre">Nombre</label>
      <input id="nu-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />

      <label htmlFor="nu-descripcion">Descripción</label>
      <input id="nu-descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />

      <label htmlFor="nu-categoria">Categoría</label>
      <select id="nu-categoria" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
        <option value="">Elige una categoría</option>
        {categorias.map((c) => (
          <option key={c._id} value={c._id}>{c.nombre}</option>
        ))}
      </select>

      <label htmlFor="nu-zona">Zona (opcional)</label>
      <select id="nu-zona" value={zonaId} onChange={(e) => setZonaId(e.target.value)}>
        <option value="">Sin zona</option>
        {zonas.map((z) => (
          <option key={z._id} value={z._id}>{z.nombre}</option>
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
