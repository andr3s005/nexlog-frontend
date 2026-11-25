import { useCallback, useEffect, useRef,  useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Polygon, Popup, Pane, useMap, useMapEvents } from "react-leaflet";
import FormNuevaUbicacion from "./FormNuevaUbicacion.jsx";
import PopupCentro from "./PopupCentro.jsx";
import ControlDibujo from "./ControlDibujo.jsx";
import FormZona from "./FormZona.jsx";
import "../styles/Mapa.css";

const CENTRO_LEON = [21.1221, -101.6824];

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

    const puntos = ubicaciones.map((u) => {
      const [lng, lat] = u.ubicacion.coordinates;
      return [lat, lng];
    });

    map.fitBounds(puntos, { padding: [40, 40] });
    yaAjustado.current = true;
  }, [ubicaciones, map]);

  return null;
}

function CentrarEn({ ubicacion }) {
  const map = useMap();

  useEffect(() => {
    if (!ubicacion) return;
    const [lng, lat] = ubicacion.ubicacion.coordinates;
    map.flyTo([lat, lng], 15);
  }, [ubicacion, map]);

  return null;
}

function ClicEnMapa({ onClic }) {
  const map = useMapEvents({
    click(e) {
      if (map.pm?.globalDrawModeEnabled()) return;
      const objetivo = e.originalEvent.target;
      if (!objetivo.isConnected || objetivo.closest(".leaflet-popup")) return;
      onClic(e.latlng);
    },
  });
  return null;
}

export default function Mapa({
  ubicaciones,
  categorias,
  zonas,
  centros,
  seleccionado,
  onCrear,
  onEditar,
  onEliminar,
  onSeleccionar,
  onCrearZona,
  onEliminarZona,
}) {
  const [puntoNuevo, setPuntoNuevo] = useState(null);
  const [zonaNueva, setZonaNueva] = useState(null);

  const manejarDibujo = useCallback((dibujo) => setZonaNueva(dibujo), []);

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
      <ClicEnMapa onClic={setPuntoNuevo} />
      <CentrarEn ubicacion={seleccionado} />
      <ControlDibujo onDibujar={manejarDibujo} />

      {zonas.map((zona) => (
        <Polygon
          key={zona._id}
          positions={zona.geometria.coordinates[0].map(([lng, lat]) => [lat, lng])}
          bubblingMouseEvents={false}
          pathOptions={{ className: "zona" }}
        >
          <Popup>
            <div className="popup-centro">
              <strong>{zona.nombre}</strong>
              <span className="popup-meta">{zona.centro?.nombre ?? "Sin centro"}</span>
              <span>{zona.descripcion}</span>
              <div className="form-acciones">
                <button type="button" className="btn-peligro" onClick={() => onEliminarZona(zona._id)}>
                  Eliminar zona
                </button>
              </div>
            </div>
          </Popup>
        </Polygon>
      ))}

      <Pane name="ubicaciones" style={{ zIndex: 450 }}>
        {ubicaciones.map((ubicacion) => {
          const [lng, lat] = ubicacion.ubicacion.coordinates;
          return (
            <CircleMarker
              key={ubicacion._id}
              center={[lat, lng]}
              radius={seleccionado?._id === ubicacion._id ? 12 : 9}
              bubblingMouseEvents={false}
              pathOptions={{ className: "marcador-centro" }}
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
          );
        })}
      </Pane>

      {puntoNuevo && (
        <Popup position={puntoNuevo} eventHandlers={{ remove: () => setPuntoNuevo(null) }}>
          <FormNuevaUbicacion
            key={`${puntoNuevo.lat}-${puntoNuevo.lng}`}
            punto={puntoNuevo}
            categorias={categorias}
            zonas={zonas}
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
