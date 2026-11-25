import { useState } from "react";
import FormNuevaUbicacion from "./FormNuevaUbicacion.jsx";

export default function PopupCentro({ centro, categorias, onEditar, onEliminar }) {
  const [modo, setModo] = useState("ver");
  const [lng, lat] = centro.ubicacion.coordinates;

  if (modo === "editar") {
    return (
      <FormNuevaUbicacion
        titulo="Editar centro"
        inicial={centro}
        punto={{ lat, lng }}
        categorias={categorias}
        onGuardar={(actualizado) => {
          onEditar(actualizado);
          setModo("ver");
        }}
        onCancelar={() => setModo("ver")}
      />
    );
  }

  return (
    <div className="popup-centro">
      <strong>{centro.nombre}</strong>
      <span className="popup-meta">{centro.categoria.nombre}</span>
      <span>{centro.descripcion}</span>
      <small className="popup-meta">{lat.toFixed(4)}, {lng.toFixed(4)}</small>

      {modo === "confirmar" ? (
        <div className="popup-confirmar">
          <span>¿Eliminar este centro?</span>
          <div className="form-acciones">
            <button type="button" className="btn-peligro" onClick={() => onEliminar(centro.id)}>
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
