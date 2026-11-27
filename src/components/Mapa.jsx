import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Polygon,
  Polyline,
  Popup,
  Pane,
  useMap,
  useMapEvents,
} from "react-leaflet";
import FormNuevaUbicacion from "./FormNuevaUbicacion.jsx";
import PopupCentro from "./PopupCentro.jsx";
import ControlDibujo from "./ControlDibujo.jsx";
import FormZona from "./FormZona.jsx";
import "../styles/Mapa.css";

const CENTRO_LEON = [21.1221, -101.6824];

// Icono cuadrado (hecho con CSS) para distinguir los centros de distribución.
const ICONO_CENTRO = L.divIcon({ className: "icono-centro", iconSize: [18, 18] });

// GeoJSON guarda [lng, lat]; Leaflet usa [lat, lng].
const aLeaflet = ([lng, lat]) => [lat, lng];

function AjustarTamano() {
  const map = useMap();

  useEffect(() => {
    const observador = new ResizeObserver(() => map.invalidateSize());
    observador.observe(map.getContainer());
    return () => observador.disconnect();
  }, [map]);

  return null;
}

function AjustarVista({ ubicaciones }) {
  const map = useMap();
  const yaAjustado = useRef(false);

  useEffect(() => {
    if (yaAjustado.current || ubicaciones.length === 0) return;
    map.fitBounds(ubicaciones.map((u) => aLeaflet(u.ubicacion.coordinates)), { padding: [40, 40] });
    yaAjustado.current = true;
  }, [ubicaciones, map]);

  return null;
}

function CentrarEn({ ubicacion }) {
  const map = useMap();

  useEffect(() => {
    if (!ubicacion) return;
    map.flyTo(aLeaflet(ubicacion.ubicacion.coordinates), 15);
  }, [ubicacion, map]);

  return null;
}

// Mueve el mapa a lo que se eligió en la lista: un punto (centro, entrega) o
// varios (los vértices de una zona o de una ruta).
function Enfocar({ enfoque }) {
  const map = useMap();

  useEffect(() => {
    if (!enfoque) return;
    const { puntos } = enfoque;
    if (puntos.length === 1) map.flyTo(puntos[0], 16);
    else map.flyToBounds(puntos, { padding: [60, 60] });
  }, [enfoque, map]);

  return null;
}

// Al hacer clic dentro de una zona se manda el punto junto con el id de la zona.
// Mientras se dibuja con Geoman, el clic se ignora.
function CapaZonas({ zonas, onClicZona }) {
  const map = useMap();

  return zonas.map((zona) => (
    <Polygon
      key={zona._id}
      positions={zona.geometria.coordinates[0].map(aLeaflet)}
      bubblingMouseEvents={false}
      className="zona"
      eventHandlers={{
        click: (e) => {
          if (map.pm?.globalDrawModeEnabled()) return;
          onClicZona({ lat: e.latlng.lat, lng: e.latlng.lng, zonaId: zona._id });
        },
      }}
    />
  ));
}

function ClicEnMapa({ onClic }) {
  const map = useMapEvents({
    click(e) {
      if (map.pm?.globalDrawModeEnabled()) return;
      const objetivo = e.originalEvent.target;
      if (!objetivo.isConnected || objetivo.closest(".leaflet-popup")) return;
      onClic({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function Mapa({
  ubicaciones,
  categorias,
  zonas,
  centros,
  entregas,
  seleccionado,
  onCrear,
  onEditar,
  onEliminar,
  onSeleccionar,
  onCrearZona,
  onDibujarRuta,
  ruta,
  geometriaRuta,
  modoPunto,
  puntoRegistro,
  onClicPunto,
  onEditarEnPanel,
  enfoque,
}) {
  const [puntoNuevo, setPuntoNuevo] = useState(null);
  const [zonaNueva, setZonaNueva] = useState(null);

  // Un clic en el mapa hace cosas distintas según la sección:
  // en Centros y Entregas elige el punto del formulario del panel;
  // en las demás abre el popup de nueva ubicación.
  function manejarClic(punto) {
    if (modoPunto) onClicPunto(punto);
    else setPuntoNuevo(punto);
  }

  // Geoman avisa qué se dibujó: una línea es una ruta nueva, un polígono una zona nueva.
  const manejarDibujo = useCallback(
    ({ tipo, geometria, centro }) => {
      if (tipo === "Line") onDibujarRuta(geometria);
      else setZonaNueva({ geometria, centro });
    },
    [onDibujarRuta]
  );

  async function guardarNueva(datos) {
    await onCrear(datos);
    setPuntoNuevo(null);
  }

  async function guardarZona({ nombre, descripcion, centroId }) {
    await onCrearZona({
      nombre,
      descripcion,
      centro: centroId,
      geometria: zonaNueva.geometria,
    });
    setZonaNueva(null);
  }

  return (
    <MapContainer center={CENTRO_LEON} zoom={13} className="mapa">
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <AjustarTamano />
      <AjustarVista ubicaciones={ubicaciones} />
      <ClicEnMapa onClic={manejarClic} />
      <CentrarEn ubicacion={seleccionado} />
      <Enfocar enfoque={enfoque} />
      <ControlDibujo onDibujar={manejarDibujo} />

      <CapaZonas zonas={zonas} onClicZona={manejarClic} />

      {/* Ruta seleccionada en la lista */}
      {ruta && (
        <Polyline positions={ruta.geometria.coordinates.map(aLeaflet)} className="ruta" bubblingMouseEvents={false} />
      )}

      {/* Ruta recién trazada que todavía no se guarda */}
      {geometriaRuta && (
        <Polyline
          positions={geometriaRuta.coordinates.map(aLeaflet)}
          className="ruta ruta-nueva"
          interactive={false}
        />
      )}

      {/* Entregas: círculo pequeño con color según su estado */}
      <Pane name="entregas" style={{ zIndex: 440 }}>
        {entregas.map((entrega) => (
          <CircleMarker
            key={entrega._id}
            center={aLeaflet(entrega.destino.coordinates)}
            radius={6}
            bubblingMouseEvents={false}
            className={`entrega entrega-${entrega.estado}`}
          >
            <Popup>
              <div onClick={(e) => e.stopPropagation()}>
                <strong>{entrega.destinatario?.nombre}</strong>
                <p>
                  {entrega.categoria} · {entrega.estado}
                </p>
                <p>
                  {entrega.direccionDestino?.calle}, {entrega.direccionDestino?.ciudad}
                </p>
                {entrega.ruta && <p>Ruta: {entrega.ruta.nombre}</p>}
                <button type="button" className="btn-editar" onClick={() => onEditarEnPanel("entregas", entrega)}>
                  Editar
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </Pane>

      {/* Centros de distribución: icono cuadrado */}
      {centros.map((centro) => (
        <Marker key={centro._id} position={aLeaflet(centro.ubicacion.coordinates)} icon={ICONO_CENTRO}>
          <Popup>
            <div onClick={(e) => e.stopPropagation()}>
              <strong>{centro.nombre}</strong>
              <p>Gerente: {centro.gerente}</p>
              <p>
                {centro.direccion?.calle}, {centro.direccion?.ciudad}
              </p>
              <p>
                Cobertura: {centro.coberturaKm} km · {centro.estado}
              </p>
              <button type="button" className="btn-editar" onClick={() => onEditarEnPanel("centros", centro)}>
                Editar
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      <Pane name="ubicaciones" style={{ zIndex: 450 }}>
        {ubicaciones.map((ubicacion) => (
          <CircleMarker
            key={ubicacion._id}
            center={aLeaflet(ubicacion.ubicacion.coordinates)}
            radius={seleccionado?._id === ubicacion._id ? 12 : 9}
            bubblingMouseEvents={false}
            className="marcador-centro"
            eventHandlers={{ click: () => onSeleccionar(ubicacion._id) }}
          >
            <Popup>
              <PopupCentro
                ubicacion={ubicacion}
                categorias={categorias}
                zonas={zonas}
                onEditar={onEditar}
                onEliminar={onEliminar}
              />
            </Popup>
          </CircleMarker>
        ))}
      </Pane>

      {/* Punto elegido para el centro o entrega que se está creando o editando */}
      {puntoRegistro && (
        <CircleMarker
          center={[puntoRegistro.lat, puntoRegistro.lng]}
          radius={14}
          className="punto-temporal"
          interactive={false}
        />
      )}

      {puntoNuevo && (
        <Popup position={puntoNuevo} eventHandlers={{ remove: () => setPuntoNuevo(null) }}>
          <FormNuevaUbicacion
            key={`${puntoNuevo.lat}-${puntoNuevo.lng}`}
            punto={puntoNuevo}
            categorias={categorias}
            zonas={zonas}
            zonaInicial={puntoNuevo.zonaId}
            onGuardar={guardarNueva}
            onCancelar={() => setPuntoNuevo(null)}
          />
        </Popup>
      )}

      {zonaNueva && (
        <Popup position={zonaNueva.centro} eventHandlers={{ remove: () => setZonaNueva(null) }}>
          <FormZona centros={centros} onGuardar={guardarZona} onCancelar={() => setZonaNueva(null)} />
        </Popup>
      )}
    </MapContainer>
  );
}
