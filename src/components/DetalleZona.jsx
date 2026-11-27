import { useState } from "react";

export default function DetalleZona({ zona, onEditar, onEliminar, onCerrar }) {
  const [confirmar, setConfirmar] = useState(false);

  return (
    <div className="detalle">
      <div className="detalle-encabezado">
        <h2>{zona.nombre}</h2>
        <button type="button" className="detalle-cerrar" aria-label="Cerrar detalle" onClick={onCerrar}>
          ×
        </button>
      </div>

      <dl>
        <dt>Centro</dt>
        <dd>{zona.centro?.nombre ?? "Sin centro"}</dd>
        <dt>Descripción</dt>
        <dd>{zona.descripcion}</dd>
        <dt>Estado</dt>
        <dd>{zona.estado}</dd>
        <dt>Vértices</dt>
        <dd>{zona.geometria.coordinates[0].length - 1}</dd>
      </dl>

      <div className="form-acciones">
        <button type="button" className="btn-editar" onClick={onEditar}>
          Editar zona
        </button>
      </div>

      <div className="form-registro-eliminar">
        {confirmar ? (
          <>
            <span>¿Eliminar esta zona?</span>
            <div className="form-acciones">
              <button type="button" className="btn-peligro" onClick={() => onEliminar(zona._id)}>
                Sí, eliminar
              </button>
              <button type="button" className="btn-secundario" onClick={() => setConfirmar(false)}>
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <button type="button" className="btn-peligro" onClick={() => setConfirmar(true)}>
            Eliminar zona
          </button>
        )}
      </div>

      <p className="detalle-nota">Haz clic dentro de una zona en el mapa para registrar una ubicación en ella.</p>
    </div>
  );
}
