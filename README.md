# NexLog · Frontend

Interfaz web del Sistema de Gestión Logística y Distribución NexLog. Permite a los administradores y operadores supervisar centros de distribución, zonas de reparto, rutas y repartidores sobre un mapa interactivo.

Backend del proyecto: [enlace al repositorio del backend]

## Tecnologías

- React con Vite
- React Router para la navegación entre vistas
- Leaflet y React Leaflet para el mapa

## Requisitos

- Node.js 20 o posterior
- npm

## Ejecución local

1. Instala las dependencias:

   npm install

2. Crea un archivo `.env` en la raíz a partir de `.env.example` y coloca la URL del backend:

   VITE_API_URL=https://nexlog-backend-tiv9.onrender.com/api

3. Inicia el servidor de desarrollo:

   npm run dev

4. Abre `http://localhost:5173` en el navegador.

## Vistas

- Acceso y solicitud de cuenta
- Panel operativo con mapa, lista, detalle y tabla de ubicaciones
- Aprobación de usuarios (solo administradores)