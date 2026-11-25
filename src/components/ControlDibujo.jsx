import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

export default function ControlDibujo({ onDibujar }) {
    const map = useMap();

    useEffect(() => {
        map.pm.addControls({
            position: "topleft",
            drawPolygon: true,
            drawMarker: false,
            drawCircleMarker: false,
            drawPolyline: false,
            drawRectangle: false,
            drawCircle: false,
            drawText: false,
            editMode: false,
            dragMode: false,
            cutPolygon: false,
            removalMode: false,
            rotateMode: false,
        });

        function alTerminar(e){
            const geometria = e.layer.toGeoJSON().geometry;
            const centro = e.layer.getBounds().getCenter();
            map.removeLayer(e.layer);
            onDibujar({ geometria, centro});
        }

        map.on("pm:create", alTerminar);

        return () => {
            map.off("pm:create", alTerminar);
            map.pm.removeControls();
        };
    }, [map, onDibujar]);

    return null;
}