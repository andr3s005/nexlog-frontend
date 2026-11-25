import { useState } from "react";
import FormNuevaUbicacion from "./FormNuevaUbicacion.jsx";

export default function PopupCentro({ ubicacion, categorias, zonas, onEditar, onEliminar }) {
  const [modo, setModo] = useState("ver");
  const [error, setError] = useState("");
  const [lng, lat] = ubicacion.ubicacion.coordinates;

  async function confirmarEliminar() {
    try {
      await onEliminar(ubicacion._id);
    } catch (err) {
      setError(err.message);
    }
  }

  if (modo === "editar") {
    return (
      <FormNuevaUbicacion
        titulo="Editar ubicación"
        inicial={ubicacion}
        punto={{ lat, lng }}
        categorias={categorias}
        zonas={zonas}
        onGuardar={async (cambios) => {
          await onEditar(ubicacion._id, cambios);
          setModo("ver");
        }}
        onCancelar={() => setModo("ver")}
      />
    );
  }

  return (
    <div className="popup-centro">
      <strong>{ubicacion.nombre}</strong>
      <span className="popup-meta">
        {ubicacion.categoria?.nombre ?? "Sin categoría"}
        {ubicacion.zona && ` · ${ubicacion.zona.nombre}`}
      </span>
      <span>{ubicacion.descripcion}</span>
      <small className="popup-meta">{lat.toFixed(4)}, {lng.toFixed(4)}</small>

      {error && <p className="form-error" role="alert">{error}</p>}

      {modo === "confirmar" ? (
        <div className="popup-confirmar">
          <span>¿Eliminar esta ubicación?</span>
          <div className="form-acciones">
            <button type="button" className="btn-peligro" onClick={confirmarEliminar}>
              Sí, eliminar
            </button>
            <button type="button" className="btn-secundario" onClick={() => setModo("ver")}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="form-acciones">
          <button type="button" className="btn-primario" onClick={() => setModo("editar")}>
            Editar
          </button>
          <button type="button" className="btn-secundario" onClick={() => setModo("confirmar")}>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
