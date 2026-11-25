export default function Detalle({ centro, onCerrar }) {
  const [lng, lat] = centro.ubicacion.coordinates;

  return (
    <div className="detalle">
      <div className="detalle-encabezado">
        <h2>{centro.nombre}</h2>
        <button type="button" className="detalle-cerrar" aria-label="Cerrar detalle" onClick={onCerrar}>
          ×
        </button>
      </div>

      <dl>
        <dt>Categoría</dt>
        <dd>{centro.categoria.nombre}</dd>
        <dt>Descripción</dt>
        <dd>{centro.descripcion}</dd>
        <dt>Coordenadas</dt>
        <dd>{lat.toFixed(4)}, {lng.toFixed(4)}</dd>
      </dl>

      <p className="detalle-nota">Para editar o eliminar este centro, usa su popup en el mapa.</p>
    </div>
  );
}
