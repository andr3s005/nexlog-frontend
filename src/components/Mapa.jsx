import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from "react-leaflet";
import FormNuevaUbicacion from "./FormNuevaUbicacion.jsx";
import PopupCentro from "./PopupCentro.jsx";
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
  useMapEvents({
    click(e) {
      const objetivo = e.originalEvent.target;
      if (!objetivo.isConnected || objetivo.closest(".leaflet-popup")) return;
      onClic(e.latlng);
    },
  });
  return null;
}

export default function Mapa({ centros, categorias, seleccionado, onCrear, onEditar, onEliminar, onSeleccionar }) {
  const [puntoNuevo, setPuntoNuevo] = useState(null);

  function guardarNuevo(centro) {
    onCrear(centro);
    setPuntoNuevo(null);
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