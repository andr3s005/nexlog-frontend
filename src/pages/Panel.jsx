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
import { SECCIONES, ESTADOS_ENTREGA } from "../data/secciones.js";
import "../styles/Panel.css";

const FILTROS_VACIOS = { nombre: "", categoria: "", zona: "" };

// Convierte cualquier geometría GeoJSON en una lista de puntos [lat, lng] para Leaflet.
function puntosDe(geometria) {
  if (geometria.type === "Point") {
    const [lng, lat] = geometria.coordinates;
    return [[lat, lng]];
  }
  const coordenadas = geometria.type === "Polygon" ? geometria.coordinates[0] : geometria.coordinates;
  return coordenadas.map(([lng, lat]) => [lat, lng]);
}

function puntoDe(geometria) {
  const [lng, lat] = geometria.coordinates;
  return { lat, lng };
}

export default function Panel() {
  const [seccion, setSeccion] = useState("ubicaciones");
  const actual = SECCIONES.find((s) => s.id === seccion);

  const [datos, setDatos] = useState({
    ubicaciones: [],
    zonas: [],
    rutas: [],
    entregas: [],
    categorias: [],
    repartidores: [],
    vehiculos: [],
    centros: [],
  });
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [aviso, setAviso] = useState(null);

  // Qué está abierto: ubicación, zona o ruta seleccionada, o el formulario genérico.
  const [seleccionado, setSeleccionado] = useState(null);
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [registro, setRegistro] = useState(null);

  // Datos geográficos del formulario abierto: el punto de un centro o entrega
  // y la línea recién trazada de una ruta nueva.
  const [puntoRegistro, setPuntoRegistro] = useState(null);
  const [geometriaRuta, setGeometriaRuta] = useState(null);

  // Lo que el mapa debe encuadrar (se cambia al seleccionar algo de la lista).
  const [enfoque, setEnfoque] = useState(null);

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

  function cerrarFormulario() {
    setRegistro(null);
    setPuntoRegistro(null);
    setGeometriaRuta(null);
  }

  function cambiarSeccion(id) {
    setSeccion(id);
    cerrarFormulario();
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

  // ---------- Ubicaciones (popup del mapa) ----------
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

  // ---------- Zonas (se crean dibujando un polígono) ----------
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

  // ---------- Rutas (se crean dibujando una línea) ----------
  // useCallback: el mapa la pasa a la herramienta de dibujo y debe ser siempre la misma función.
  const manejarRutaDibujada = useCallback((geometria) => {
    setSeccion("rutas");
    setZonaSeleccionada(null);
    setRutaSeleccionada(null);
    setPuntoRegistro(null);
    setGeometriaRuta(geometria);
    setRegistro({});
    setAviso({ tipo: "info", texto: "Completa los datos de la nueva ruta." });
  }, []);

  // ---------- Formulario genérico (crear y editar cualquier sección con campos) ----------
  async function guardarRegistro(valores) {
    const esNuevo = !registro._id;

    if (esNuevo) {
      let cuerpo = valores;
      if (actual.id === "rutas") {
        if (!geometriaRuta) throw new Error("Primero traza la ruta con el botón de línea del mapa.");
        cuerpo = { ...valores, geometria: geometriaRuta, paradas: [] };
      }
      await crear(actual.ruta, cuerpo);
    } else {
      await actualizar(actual.ruta, registro._id, valores);
    }

    await cargar(actual.id);
    // Las zonas, rutas y entregas muestran el nombre de su centro: si cambia un centro, se recargan.
    if (actual.id === "centros") {
      await Promise.all([cargar("zonas"), cargar("rutas"), cargar("entregas")]);
    }

    cerrarFormulario();
    setAviso({ tipo: "exito", texto: esNuevo ? "Registro creado." : "Cambios guardados." });
  }

  async function eliminarRegistro() {
    const id = registro._id;
    await eliminar(actual.ruta, id);
    if (zonaSeleccionada === id) setZonaSeleccionada(null);
    if (rutaSeleccionada === id) setRutaSeleccionada(null);
    await cargar(actual.id);
    cerrarFormulario();
    setAviso({ tipo: "exito", texto: "Registro eliminado." });
  }

  // ---------- Clics del mapa en Centros y Entregas ----------
  // Si no hay formulario abierto, abre uno nuevo; si ya hay uno, solo mueve el punto.
  function manejarClicPunto(punto) {
    if (!registro) {
      setRegistro(actual.id === "entregas" && punto.zonaId ? { zona: punto.zonaId } : {});
    }
    setPuntoRegistro({ lat: punto.lat, lng: punto.lng });
  }

  // El botón "Editar" de los popups de centros y entregas abre su formulario en el panel.
  function editarDesdeMapa(seccionId, item) {
    const config = SECCIONES.find((s) => s.id === seccionId);
    setSeccion(seccionId);
    setZonaSeleccionada(null);
    setRutaSeleccionada(null);
    setGeometriaRuta(null);
    setRegistro(item);
    setPuntoRegistro(puntoDe(item[config.punto]));
  }

  // ---------- Botón "Nuevo" y selección en la lista ----------
  function manejarNuevo() {
    if (actual.id === "ubicaciones") {
      setAviso({ tipo: "info", texto: "Haz clic en el mapa para colocar la nueva ubicación." });
    } else if (actual.id === "zonas") {
      setAviso({ tipo: "info", texto: "Usa el botón de polígono del mapa para dibujar la zona." });
    } else if (actual.id === "rutas") {
      setAviso({ tipo: "info", texto: "Usa el botón de línea del mapa para trazar la ruta." });
    } else if (actual.campos) {
      setSeleccionado(null);
      setPuntoRegistro(null);
      setRegistro({});
      if (actual.punto) setAviso({ tipo: "info", texto: "Haz clic en el mapa para elegir la ubicación." });
    }
  }

  function manejarSeleccion(item) {
    if (actual.id === "ubicaciones") {
      cerrarFormulario();
      setSeleccionado(item._id);
    } else if (actual.id === "zonas") {
      cerrarFormulario();
      setZonaSeleccionada(item._id);
      setEnfoque({ puntos: puntosDe(item.geometria) });
    } else if (actual.id === "rutas") {
      cerrarFormulario();
      setRutaSeleccionada(item._id);
      setEnfoque({ puntos: puntosDe(item.geometria) });
    } else if (actual.campos) {
      setSeleccionado(null);
      setRegistro(item);
      if (actual.punto) {
        setPuntoRegistro(puntoDe(item[actual.punto]));
        setEnfoque({ puntos: puntosDe(item[actual.punto]) });
      }
    }
  }

  function idSeleccionadoEnLista() {
    if (actual.id === "ubicaciones") return seleccionado;
    if (actual.id === "zonas") return zonaSeleccionada;
    if (actual.id === "rutas") return rutaSeleccionada;
    return registro?._id;
  }

  // ---------- Panel derecho: formulario o detalle, según lo seleccionado ----------
  function contenidoDerecho() {
    if (registro && actual.campos) {
      return (
        <FormRegistro
          key={registro._id ?? "nuevo"}
          seccion={actual}
          inicial={registro}
          colecciones={datos}
          punto={puntoRegistro}
          onGuardar={guardarRegistro}
          onEliminar={eliminarRegistro}
          onCancelar={cerrarFormulario}
        />
      );
    }
    if (actual.id === "zonas" && zonaDetalle) {
      return (
        <DetalleZona
          zona={zonaDetalle}
          onEditar={() => setRegistro(zonaDetalle)}
          onEliminar={eliminarZona}
          onCerrar={() => setZonaSeleccionada(null)}
        />
      );
    }
    if (actual.id === "rutas" && rutaDetalle) {
      return (
        <DetalleRuta
          ruta={rutaDetalle}
          onEditar={() => setRegistro(rutaDetalle)}
          onCerrar={() => setRutaSeleccionada(null)}
        />
      );
    }
    if (ubicacionSeleccionada) {
      return <Detalle ubicacion={ubicacionSeleccionada} onCerrar={() => setSeleccionado(null)} />;
    }
    return null;
  }

  const panelDerecho = contenidoDerecho();

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
            seleccionadoId={idSeleccionadoEnLista()}
            onSeleccionar={manejarSeleccion}
          />
        </aside>

        <main className="panel-mapa">
          <Mapa
            ubicaciones={datos.ubicaciones}
            categorias={datos.categorias}
            zonas={datos.zonas}
            centros={datos.centros}
            entregas={datos.entregas}
            seleccionado={ubicacionSeleccionada}
            onCrear={crearUbicacion}
            onEditar={editarUbicacion}
            onEliminar={eliminarUbicacion}
            onSeleccionar={setSeleccionado}
            onCrearZona={crearZona}
            onDibujarRuta={manejarRutaDibujada}
            ruta={actual.id === "rutas" ? rutaDetalle : null}
            geometriaRuta={geometriaRuta}
            modoPunto={Boolean(actual.punto)}
            puntoRegistro={puntoRegistro}
            onClicPunto={manejarClicPunto}
            onEditarEnPanel={editarDesdeMapa}
            enfoque={enfoque}
          />

          {actual.id === "entregas" && (
            <div className="leyenda">
              {ESTADOS_ENTREGA.map((estado) => (
                <span key={estado}>
                  <span className={`leyenda-color leyenda-${estado}`} aria-hidden="true" />
                  {estado}
                </span>
              ))}
            </div>
          )}

          {aviso && (
            <p className={`mensaje mensaje-${aviso.tipo} aviso-flotante`} role="status">
              {aviso.texto}
            </p>
          )}
        </main>

        {panelDerecho && <aside className="panel-detalle">{panelDerecho}</aside>}
      </div>

      <PanelInferior
        ubicaciones={datos.ubicaciones}
        seleccionado={seleccionado}
        onSeleccionar={setSeleccionado}
      />
    </div>
  );
}
