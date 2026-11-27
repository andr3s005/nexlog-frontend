import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

// Agrega a la esquina del mapa los botones de Geoman: polígono (zonas) y línea (rutas).
export default function ControlDibujo({ onDibujar }) {
    const map = useMap();

    useEffect(() => {
        map.pm.addControls({
            position: "topleft",
            drawPolygon: true,
            drawPolyline: true,
            drawMarker: false,
            drawCircleMarker: false,
            drawRectangle: false,
            drawCircle: false,
            drawText: false,
            editMode: false,
            dragMode: false,
            cutPolygon: false,
            removalMode: false,
            rotateMode: false,
        });

        // Al terminar un dibujo se saca su GeoJSON, se borra la capa temporal
        // y se avisa al mapa qué figura fue (e.shape es "Polygon" o "Line").
        function alTerminar(e) {
            const geometria = e.layer.toGeoJSON().geometry;
            const centro = e.layer.getBounds().getCenter();
            map.removeLayer(e.layer);
            onDibujar({ tipo: e.shape, geometria, centro });
        }

        map.on("pm:create", alTerminar);

        return () => {
            map.off("pm:create", alTerminar);
            map.pm.removeControls();
        };
    }, [map, onDibujar]);

    return null;
}
