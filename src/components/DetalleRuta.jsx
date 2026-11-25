export default function DetalleRuta({ ruta, onCerrar }) {
  return (
    <div className="detalle">
      <div className="detalle-encabezado">
        <h2>{ruta.nombre}</h2>
        <button type="button" className="detalle-cerrar" aria-label="Cerrar detalle" onClick={onCerrar}>
          ×
        </button>
      </div>

      <dl>
        <dt>Estado</dt>
        <dd>{ruta.estado}</dd>
        <dt>Sale de</dt>
        <dd>{ruta.centro?.nombre ?? "Sin centro"}</dd>
        <dt>Repartidor</dt>
        <dd>
          {ruta.repartidor ? `${ruta.repartidor.nombre} · ${ruta.repartidor.telefono}` : "Sin asignar"}
        </dd>
        <dt>Vehículo</dt>
        <dd>
          {ruta.vehiculo ? `${ruta.vehiculo.placa} · ${ruta.vehiculo.marca} ${ruta.vehiculo.modelo}` : "Sin asignar"}
        </dd>
        <dt>Paradas</dt>
        <dd>
          <ol className="detalle-paradas">
            {ruta.paradas.map((parada) => (
              <li key={parada.orden}>
                {parada.entrega
                  ? `${parada.entrega.destinatario.nombre} · ${parada.entrega.direccionDestino.calle} (${parada.entrega.estado})`
                  : "Entrega no disponible"}
              </li>
            ))}
          </ol>
        </dd>
      </dl>

      <p className="detalle-nota">La línea naranja del mapa muestra el recorrido de la ruta.</p>
    </div>
  );
}
