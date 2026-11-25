import { useEffect, useState } from "react";
import { CENTROS_EJEMPLO, CATEGORIAS_EJEMPLO } from "../data/ejemplos.js";
import TopBar from "../components/TopBar.jsx";
import Mapa from "../components/Mapa.jsx";
import ListaSeccion from "../components/ListaSeccion.jsx";
import Detalle from "../components/Detalle.jsx";
import PanelInferior from "../components/PanelInferior.jsx";
import "../styles/Panel.css";

const SECCIONES = [
  { id: "centros", label: "Centros", nuevo: "Nuevo centro" },
  { id: "rutas", label: "Rutas", nuevo: "Nueva ruta" },
  { id: "entregas", label: "Entregas", nuevo: "Nueva entrega" },
  { id: "repartidores", label: "Repartidores", nuevo: "Nuevo repartidor" },
  { id: "vehiculos", label: "Vehículos", nuevo: "Nuevo vehículo" },
  { id: "zonas", label: "Zonas", nuevo: "Dibujar zona" },
  { id: "categorias", label: "Categorías", nuevo: "Nueva categoría" },
];

export default function Panel() {
  const [seccion, setSeccion] = useState("centros");
  const actual = SECCIONES.find((s) => s.id === seccion);

  const [centros, setCentros] = useState(CENTROS_EJEMPLO);
  const [seleccionado, setSeleccionado] = useState(null);

  const centroSeleccionado = centros.find((c) => c.id === seleccionado) || null;

  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(null), 3000);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  function crearCentro(nuevo) {
    setCentros((anteriores) => [...anteriores, nuevo]);
    setAviso({ tipo: "exito", texto: "Centro registrado." });
  }

  function editarCentro(actualizado) {
    setCentros((anteriores) => anteriores.map((c) => (c.id === actualizado.id ? actualizado : c)));
    setAviso({ tipo: "exito", texto: "Centro actualizado." });
  }

  function eliminarCentro(id) {
    setCentros((anteriores) => anteriores.filter((c) => c.id !== id));
    if (seleccionado === id) setSeleccionado(null);
    setAviso({ tipo: "exito", texto: "Centro eliminado." });
  }

  return (
    <div className="panel">
      <TopBar secciones={SECCIONES} actual={actual} onCambiarSeccion={setSeccion} />

      <div className="panel-cuerpo">
        <aside className="panel-lista">
          <ListaSeccion
            seccion={actual}
            centros={centros}
            seleccionado={seleccionado}
            onSeleccionar={setSeleccionado}
          />
        </aside>

        <main className="panel-mapa">
          <Mapa
            centros={centros}
            categorias={CATEGORIAS_EJEMPLO}
            seleccionado={centroSeleccionado}
            onCrear={crearCentro}
            onEditar={editarCentro}
            onEliminar={eliminarCentro}
            onSeleccionar={setSeleccionado}
          />
          {aviso && (
            <p className={`mensaje mensaje-${aviso.tipo} aviso-flotante`} role="status">
              {aviso.texto}
            </p>
          )}
        </main>

        {centroSeleccionado && (
          <aside className="panel-detalle">
            <Detalle centro={centroSeleccionado} onCerrar={() => setSeleccionado(null)} />
          </aside>
        )}
      </div>

      <PanelInferior centros={centros} seleccionado={seleccionado} onSeleccionar={setSeleccionado} />
    </div>
  );
}