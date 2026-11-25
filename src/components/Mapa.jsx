import { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Polygon, Popup, useMap, useMapEvents } from "react-leaflet";
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

function CentrarEn({ centro }) {
  const map = useMap();

  useEffect(() => {
    if (!centro) return;
    const [lng, lat] = centro.ubicacion.coordinates;
    map.flyTo([lat, lng], 15);
  }, [centro, map]);

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

export default function Mapa({ centros, categorias, zonas, seleccionado, onCrear, onEditar, onEliminar, onSeleccionar, onCrearZona, onEliminarZona }) {
  const [puntoNuevo, setPuntoNuevo] = useState(null);
  const [zonaNueva, setZonaNueva] = useState(null);

  const manejarDibujo = useCallback((dibujo) => setZonaNueva(dibujo), []);

  function guardarNuevo(centro) {
    onCrear(centro);
    setPuntoNuevo(null);
  }
  
  function guardarZona({ nombre, descripcion, centroId }) {
    const centro = centros.find((c) => c.id === centroId);
    onCrearZona({
      id: String(Date.now()),
      nombre,
      descripcion,
      centro: { id: centro.id, nombre: centro.nombre },
      geometria: zonaNueva.geometria,
    });
    setZonaNueva(null);
  }


  return (
    <MapContainer center={CENTRO_LEON} zoom={15} className="mapa">
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <AjustarTamano />
      <ClicEnMapa onClic={setPuntoNuevo} />
      <CentrarEn centro={seleccionado} />

      <ControlDibujo onDibujar={manejarDibujo} />

      {zonas.map((zona) => (
        <Polygon
          key={zona.id}
          positions={zona.geometria.coordinates[0].map(([lng, lat]) => [lat, lng])}
          bubblingMouseEvents={false}
          pathOptions={{ className: "zona" }}
        >
          <Popup>
            <div className="popup-centro">
              <strong>{zona.nombre}</strong>
              <span className="popup-meta">{zona.centro.nombre}</span>
              <span>{zona.descripcion}</span>
              <div className="form-acciones">
                <button type="button" className="btn-peligro" onClick={() => onEliminarZona(zona.id)}>
                  Eliminar zona
                </button>
              </div>
            </div>
          </Popup>
        </Polygon>
      ))}

      {zonaNueva && (
        <Popup
          position={zonaNueva.centro}
          eventHandlers={{ remove: () => setZonaNueva(null) }}
        >
          <FormZona centros={centros} onGuardar={guardarZona} onCancelar={() => setZonaNueva(null)} />
        </Popup>
      )}

      {centros.map((centro) => {
        const [lng, lat] = centro.ubicacion.coordinates;
        return (
          <CircleMarker
            key={centro.id}
            center={[lat, lng]}
            radius={seleccionado?.id === centro.id ? 12 : 9}
            bubblingMouseEvents={false}
            pathOptions={{ className: "marcador-centro" }}
            eventHandlers={{ click: () => onSeleccionar(centro.id) }}
          >
            <Popup>
              <PopupCentro
                centro={centro}
                categorias={categorias}
                onEditar={onEditar}
                onEliminar={onEliminar}
              />
            </Popup>
          </CircleMarker>
        );
      })}

      {puntoNuevo && (
        <Popup
          position={puntoNuevo}
          eventHandlers={{ remove: () => setPuntoNuevo(null) }}
        >
          <FormNuevaUbicacion
            key={`${puntoNuevo.lat}-${puntoNuevo.lng}`}
            punto={puntoNuevo}
            categorias={categorias}
            onGuardar={guardarNuevo}
            onCancelar={() => setPuntoNuevo(null)}
          />
        </Popup>
      )}
    </MapContainer>
  );
}