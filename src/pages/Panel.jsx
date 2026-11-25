import { useCallback, useEffect, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import Mapa from "../components/Mapa.jsx";
import ListaSeccion from "../components/ListaSeccion.jsx";
import Detalle from "../components/Detalle.jsx";
import DetalleZona from "../components/DetalleZona.jsx";
import DetalleRuta from "../components/DetalleRuta.jsx";
import FormRegistro from "../components/FormRegistro.jsx";
import PanelInferior from "../components/PanelInferior.jsx";
import { listar, crear, actualizar, eliminar } from "../services/recursos.js";
import { SECCIONES } from "../data/secciones.js";
import "../styles/Panel.css";

const FILTROS_VACIOS = { nombre: "", categoria: "", zona: "" };

export default function Panel() {
  const [seccion, setSeccion] = useState("ubicaciones");
  const actual = SECCIONES.find((s) => s.id === seccion);

  const [datos, setDatos] = useState({
    ubicaciones: [],
    zonas: [],
    categorias: [],
    repartidores: [],
    vehiculos: [],
    rutas: [],
    centros: [],
  });
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [seleccionado, setSeleccionado] = useState(null);
  const [registro, setRegistro] = useState(null);
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [aviso, setAviso] = useState(null);

  const ubicacionSeleccionada = datos.ubicaciones.find((u) => u._id === seleccionado) || null;
  const zonaDetalle = datos.zonas.find((z) => z._id === zonaSeleccionada) || null;
  const rutaDetalle = datos.rutas.find((r) => r._id === rutaSeleccionada) || null;

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  const cargar = useCallback(async (id, params = {}) => {
    const config = SECCIONES.find((s) => s.id === id);
    const lista = await listar(config.ruta, params);
    setDatos((anteriores) => ({ ...anteriores, [id]: lista }));
  }, []);

  useEffect(() => {
    Promise.all(SECCIONES.map((s) => cargar(s.id)))
      .catch((error) => setAviso({ tipo: "error", texto: error.message }))
      .finally(() => setCargando(false));
  }, [cargar]);

  function cambiarSeccion(id) {
    setSeccion(id);
    setRegistro(null);
    setZonaSeleccionada(null);
    setRutaSeleccionada(null);
  }

  async function aplicarFiltros(nuevos) {
    setFiltros(nuevos);
    try {
      await cargar("ubicaciones", nuevos);
    } catch (error) {
      setAviso({ tipo: "error", texto: error.message });
    }
  }

  async function crearUbicacion(nueva) {
    await crear("/ubicaciones", nueva);
    await cargar("ubicaciones", filtros);
    setAviso({ tipo: "exito", texto: "Ubicación registrada." });
  }

  async function editarUbicacion(id, cambios) {
    await actualizar("/ubicaciones", id, cambios);
    await cargar("ubicaciones", filtros);
    setAviso({ tipo: "exito", texto: "Ubicación actualizada." });
  }

  async function eliminarUbicacion(id) {
    await eliminar("/ubicaciones", id);
    if (seleccionado === id) setSeleccionado(null);
    await cargar("ubicaciones", filtros);
    setAviso({ tipo: "exito", texto: "Ubicación eliminada." });
  }

  async function crearZona(nueva) {
    await crear("/zonas-reparto", nueva);
    await cargar("zonas");
    setAviso({ tipo: "exito", texto: "Zona guardada." });
  }

  async function eliminarZona(id) {
    try {
      await eliminar("/zonas-reparto", id);
      setZonaSeleccionada(null);
      await cargar("zonas");
      setAviso({ tipo: "exito", texto: "Zona eliminada." });
    } catch (error) {
      setAviso({ tipo: "error", texto: error.message });
    }
  }

  async function guardarRegistro(valores) {
    const esNuevo = !registro._id;
    if (esNuevo) {
      await crear(actual.ruta, valores);
    } else {
      await actualizar(actual.ruta, registro._id, valores);
    }
    await cargar(actual.id);
    setRegistro(null);
    setAviso({ tipo: "exito", texto: esNuevo ? "Registro creado." : "Cambios guardados." });
  }

  async function eliminarRegistro() {
    await eliminar(actual.ruta, registro._id);
    await cargar(actual.id);
    setRegistro(null);
    setAviso({ tipo: "exito", texto: "Registro eliminado." });
  }

  function manejarNuevo() {
    if (actual.id === "ubicaciones") {
      setAviso({ tipo: "info", texto: "Haz clic en el mapa para colocar la nueva ubicación." });
    } else if (actual.id === "zonas") {
      setAviso({ tipo: "info", texto: "Usa el botón de polígono del mapa para dibujar la zona." });
    } else if (actual.campos) {
      setSeleccionado(null);
      setRegistro({});
    }
  }

  function manejarSeleccion(item) {
    if (actual.id === "ubicaciones") {
      setRegistro(null);
      setSeleccionado(item._id);
    } else if (actual.id === "zonas") {
      setSeleccionado(null);
      setZonaSeleccionada(item._id);
    } else if (actual.id === "rutas") {
      setSeleccionado(null);
      setRutaSeleccionada(item._id);
    } else if (actual.campos) {
      setSeleccionado(null);
      setRegistro(item);
    }
  }

  return (
    <div className="panel">
      <TopBar
        secciones={SECCIONES}
        actual={actual}
        onCambiarSeccion={cambiarSeccion}
        categorias={datos.categorias}
        zonas={datos.zonas}
        filtros={filtros}
        onFiltrar={aplicarFiltros}
        onNuevo={manejarNuevo}
      />

      <div className="panel-cuerpo">
        <aside className="panel-lista">
          <ListaSeccion
            seccion={actual}
            items={datos[actual.id]}
            cargando={cargando}
            seleccionadoId={
              actual.id === "ubicaciones"
                ? seleccionado
                : actual.id === "zonas"
                  ? zonaSeleccionada
                  : actual.id === "rutas"
                    ? rutaSeleccionada
                    : registro?._id
            }
            onSeleccionar={manejarSeleccion}
          />
        </aside>

        <main className="panel-mapa">
          <Mapa
            ubicaciones={datos.ubicaciones}
            categorias={datos.categorias}
            zonas={datos.zonas}
            centros={datos.centros}
            seleccionado={ubicacionSeleccionada}
            onCrear={crearUbicacion}
            onEditar={editarUbicacion}
            onEliminar={eliminarUbicacion}
            onSeleccionar={setSeleccionado}
            onCrearZona={crearZona}
            ruta={actual.id === "rutas" ? rutaDetalle : null}
          />
          {aviso && (
            <p className={`mensaje mensaje-${aviso.tipo} aviso-flotante`} role="status">
              {aviso.texto}
            </p>
          )}
        </main>

        {registro && actual.campos && (
          <aside className="panel-detalle">
            <FormRegistro
              key={registro._id ?? "nuevo"}
              seccion={actual}
              inicial={registro}
              onGuardar={guardarRegistro}
              onEliminar={eliminarRegistro}
              onCancelar={() => setRegistro(null)}
            />
          </aside>
        )}

        {!registro && zonaDetalle && actual.id === "zonas" && (
          <aside className="panel-detalle">
            <DetalleZona zona={zonaDetalle} onEliminar={eliminarZona} onCerrar={() => setZonaSeleccionada(null)} />
          </aside>
        )}

        {rutaDetalle && actual.id === "rutas" && (
          <aside className="panel-detalle">
            <DetalleRuta ruta={rutaDetalle} onCerrar={() => setRutaSeleccionada(null)} />
          </aside>
        )}

        {!registro && !(zonaDetalle && actual.id === "zonas") && !(rutaDetalle && actual.id === "rutas") && ubicacionSeleccionada && (
          <aside className="panel-detalle">
            <Detalle ubicacion={ubicacionSeleccionada} onCerrar={() => setSeleccionado(null)} />
          </aside>
        )}
      </div>

      <PanelInferior
        ubicaciones={datos.ubicaciones}
        seleccionado={seleccionado}
        onSeleccionar={setSeleccionado}
      />
    </div>
  );
}
