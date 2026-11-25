export default function ListaSeccion({ seccion, centros, zonas,  seleccionado, onSeleccionar }) {
  if (seccion.id === "zonas") {
  return (
    <>
      <h2 className="lista-titulo">Zonas ({zonas.length})</h2>
      {zonas.length === 0 ? (
        <p className="lista-vacia">Dibuja una zona con el botón de polígono del mapa.</p>
      ) : (
        <ul className="lista">
          {zonas.map((zona) => (
            <li key={zona.id}>
              <div className="lista-item">
                <strong>{zona.nombre}</strong>
                <span>{zona.centro.nombre}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
  if (seccion.id !== "centros") {
    return (
      <>
        <h2 className="lista-titulo">{seccion.label}</h2>
        <p className="lista-vacia">Se cargará desde la API.</p>
      </>
    );
  }

  return (
    <>
      <h2 className="lista-titulo">Centros ({centros.length})</h2>
      <ul className="lista">
        {centros.map((centro) => (
          <li key={centro.id}>
            <button
              type="button"
              className={centro.id === seleccionado ? "lista-item activo" : "lista-item"}
              onClick={() => onSeleccionar(centro.id)}
            >
              <strong>{centro.nombre}</strong>
              <span>{centro.categoria.nombre}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
