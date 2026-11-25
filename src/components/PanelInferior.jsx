import { useState } from "react";

const PESTANAS = [
  { id: "ubicaciones", label: "Ubicaciones" },
  { id: "alertas", label: "Alertas" },
  { id: "tiempo", label: "Línea de tiempo" },
];

export default function PanelInferior({ ubicaciones, seleccionado, onSeleccionar }) {
  const [pestana, setPestana] = useState("ubicaciones");
  const [abierto, setAbierto] = useState(true);

  return (
    <section className={abierto ? "panel-inferior" : "panel-inferior plegado"}>
      <div className="inferior-barra" role="tablist">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pestana === p.id}
            className={pestana === p.id ? "inferior-pestana activa" : "inferior-pestana"}
            onClick={() => {
              setPestana(p.id);
              setAbierto(true);
            }}
          >
            {p.label}
            {p.id === "ubicaciones" && ` (${ubicaciones.length})`}
          </button>
        ))}
        <button type="button" className="btn-secundario inferior-plegar" onClick={() => setAbierto(!abierto)}>
          {abierto ? "Plegar" : "Mostrar"}
        </button>
      </div>

      {abierto && (
        <div className="inferior-contenido">
          {pestana === "ubicaciones" && (
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Zona</th>
                  <th>Latitud</th>
                  <th>Longitud</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {ubicaciones.map((u) => {
                  const [lng, lat] = u.ubicacion.coordinates;
                  return (
                    <tr
                      key={u._id}
                      className={u._id === seleccionado ? "fila-activa" : ""}
                      onClick={() => onSeleccionar(u._id)}
                    >
                      <td>{u.nombre}</td>
                      <td>{u.descripcion}</td>
                      <td>{u.categoria?.nombre ?? "Sin categoría"}</td>
                      <td>{u.zona?.nombre ?? "—"}</td>
                      <td>{lat.toFixed(4)}</td>
                      <td>{lng.toFixed(4)}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString("es-MX")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {pestana === "alertas" && <p className="lista-vacia">No hay alertas por ahora.</p>}

          {pestana === "tiempo" && (
            <p className="lista-vacia">Aparecerá cuando haya rutas en simulación.</p>
          )}
        </div>
      )}
    </section>
  );
}
