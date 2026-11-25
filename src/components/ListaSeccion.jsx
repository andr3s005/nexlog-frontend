export default function ListaSeccion({ seccion, centros, seleccionado, onSeleccionar }) {
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
