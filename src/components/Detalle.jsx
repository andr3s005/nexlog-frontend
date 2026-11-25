export default function Detalle({ ubicacion, onCerrar }) {
  const [lng, lat] = ubicacion.ubicacion.coordinates;

  return (
    <div className="detalle">
      <div className="detalle-encabezado">
        <h2>{ubicacion.nombre}</h2>
        <button type="button" className="detalle-cerrar" aria-label="Cerrar detalle" onClick={onCerrar}>
          ×
        </button>
      </div>

      <dl>
        <dt>Categoría</dt>
        <dd>{ubicacion.categoria?.nombre ?? "Sin categoría"}</dd>
        <dt>Descripción</dt>
        <dd>{ubicacion.descripcion || "Sin descripción"}</dd>
        <dt>Zona</dt>
        <dd>{ubicacion.zona?.nombre ?? "Sin zona"}</dd>
        <dt>Coordenadas</dt>
        <dd>{lat.toFixed(4)}, {lng.toFixed(4)}</dd>
        <dt>Registrada</dt>
        <dd>{new Date(ubicacion.createdAt).toLocaleDateString("es-MX")}</dd>
      </dl>

      <p className="detalle-nota">Para editar o eliminar esta ubicación, usa su popup en el mapa.</p>
    </div>
  );
}
