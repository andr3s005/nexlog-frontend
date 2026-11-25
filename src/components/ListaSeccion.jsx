export default function ListaSeccion({ seccion, items, cargando, seleccionadoId, onSeleccionar }) {
  if (cargando) {
    return <p className="lista-vacia">Cargando {seccion.label.toLowerCase()}…</p>;
  }

  return (
    <>
      <h2 className="lista-titulo">
        {seccion.label} ({items.length})
      </h2>

      {items.length === 0 ? (
        <p className="lista-vacia">No hay registros todavía.</p>
      ) : (
        <ul className="lista">
          {items.map((item) => (
            <li key={item._id}>
              <button
                type="button"
                className={item._id === seleccionadoId ? "lista-item activo" : "lista-item"}
                onClick={() => onSeleccionar(item)}
              >
                <strong>{seccion.titulo(item)}</strong>
                <span>{seccion.subtitulo(item)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {seccion.id === "centros" && (
        <p className="lista-vacia">Los centros se consultan aquí; se registran desde el backend.</p>
      )}
    </>
  );
}
