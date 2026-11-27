export const ESTADOS_ENTREGA = ["pendiente", "asignada", "en_ruta", "entregada", "incidencia", "cancelada"];

// Cada sección del menú: su ruta en la API, qué mostrar en la lista y, si tiene
// formulario, sus campos. Tipos de campo que entiende FormRegistro:
//   - texto (por defecto) y "numero"
//   - opciones: select con valores fijos
//   - relacion: select con los registros de otra colección (guarda su _id)
//   - nombres con punto ("direccion.calle") para objetos anidados
// "punto" indica qué campo GeoJSON Point se llena con un clic en el mapa.
export const SECCIONES = [
  {
    id: "ubicaciones",
    label: "Ubicaciones",
    nuevo: "Nueva ubicación",
    ruta: "/ubicaciones",
    titulo: (r) => r.nombre,
    subtitulo: (r) => r.categoria?.nombre ?? "Sin categoría",
  },
  {
    id: "zonas",
    label: "Zonas",
    nuevo: "Dibujar zona",
    ruta: "/zonas-reparto",
    titulo: (r) => r.nombre,
    subtitulo: (r) => r.centro?.nombre ?? "Sin centro",
    campos: [
      { nombre: "nombre", etiqueta: "Nombre", requerido: true },
      { nombre: "descripcion", etiqueta: "Descripción", requerido: true },
      { nombre: "centro", etiqueta: "Centro", relacion: "centros", requerido: true },
      { nombre: "estado", etiqueta: "Estado", opciones: ["activa", "inactiva"] },
    ],
  },
  {
    id: "rutas",
    label: "Rutas de reparto",
    nuevo: "Trazar ruta",
    ruta: "/rutas",
    titulo: (r) => r.nombre,
    subtitulo: (r) => `${r.repartidor?.nombre ?? "Sin repartidor"} · ${r.estado}`,
    notaNuevo: "La línea que trazaste en el mapa será el recorrido de la ruta.",
    campos: [
      { nombre: "nombre", etiqueta: "Nombre", requerido: true },
      { nombre: "centro", etiqueta: "Sale del centro", relacion: "centros", requerido: true },
      { nombre: "repartidor", etiqueta: "Repartidor", relacion: "repartidores" },
      { nombre: "vehiculo", etiqueta: "Vehículo", relacion: "vehiculos" },
      { nombre: "estado", etiqueta: "Estado", opciones: ["planificada", "en_curso", "pausada", "completada", "cancelada"] },
    ],
  },
  {
    id: "entregas",
    label: "Entregas",
    nuevo: "Nueva entrega",
    ruta: "/entregas",
    punto: "destino",
    titulo: (r) => r.destinatario.nombre,
    subtitulo: (r) => `${r.categoria} · ${r.estado}`,
    notaNuevo: "Haz clic en el mapa para elegir el destino de la entrega.",
    campos: [
      { nombre: "destinatario.nombre", etiqueta: "Destinatario", requerido: true },
      { nombre: "destinatario.telefono", etiqueta: "Teléfono", requerido: true },
      { nombre: "categoria", etiqueta: "Tipo de envío", opciones: ["Express", "Estándar", "Frágil", "Documentación", "Comercio"] },
      { nombre: "direccionDestino.calle", etiqueta: "Calle y número", requerido: true },
      { nombre: "direccionDestino.ciudad", etiqueta: "Ciudad", requerido: true },
      { nombre: "direccionDestino.estado", etiqueta: "Estado (entidad)", requerido: true },
      { nombre: "centro", etiqueta: "Centro", relacion: "centros" },
      { nombre: "zona", etiqueta: "Zona", relacion: "zonas" },
      { nombre: "estado", etiqueta: "Estado de la entrega", opciones: ESTADOS_ENTREGA },
      { nombre: "observaciones", etiqueta: "Observaciones" },
    ],
  },
  {
    id: "categorias",
    label: "Categorías",
    nuevo: "Nueva categoría",
    ruta: "/categorias",
    titulo: (r) => r.nombre,
    subtitulo: (r) => r.descripcion || "Sin descripción",
    campos: [
      { nombre: "nombre", etiqueta: "Nombre", requerido: true },
      { nombre: "descripcion", etiqueta: "Descripción" },
    ],
  },
  {
    id: "repartidores",
    label: "Repartidores",
    nuevo: "Nuevo repartidor",
    ruta: "/repartidores",
    titulo: (r) => r.nombre,
    subtitulo: (r) => `${r.telefono} · ${r.estado}`,
    campos: [
      { nombre: "nombre", etiqueta: "Nombre", requerido: true },
      { nombre: "telefono", etiqueta: "Teléfono", requerido: true },
      { nombre: "estado", etiqueta: "Estado", opciones: ["disponible", "asignado", "inactivo"] },
    ],
  },
  {
    id: "vehiculos",
    label: "Vehículos",
    nuevo: "Nuevo vehículo",
    ruta: "/vehiculos",
    titulo: (r) => r.placa,
    subtitulo: (r) => `${r.marca} ${r.modelo} · ${r.estado}`,
    campos: [
      { nombre: "placa", etiqueta: "Placa", requerido: true },
      { nombre: "tipo", etiqueta: "Tipo", opciones: ["camion", "camioneta"] },
      { nombre: "marca", etiqueta: "Marca", opciones: ["Ford", "Toyota", "Chevrolet"] },
      { nombre: "modelo", etiqueta: "Modelo", requerido: true },
      { nombre: "estado", etiqueta: "Estado", opciones: ["disponible", "asignado", "mantenimiento", "inactivo"] },
    ],
  },
  {
    id: "centros",
    label: "Centros de distribución",
    nuevo: "Nuevo centro",
    ruta: "/centros-distribucion",
    punto: "ubicacion",
    titulo: (r) => r.nombre,
    subtitulo: (r) => `${r.direccion?.ciudad ?? ""} · ${r.estado}`,
    notaNuevo: "Haz clic en el mapa para elegir la ubicación del centro.",
    campos: [
      { nombre: "nombre", etiqueta: "Nombre", requerido: true },
      { nombre: "gerente", etiqueta: "Gerente", requerido: true },
      { nombre: "direccion.calle", etiqueta: "Calle y número", requerido: true },
      { nombre: "direccion.ciudad", etiqueta: "Ciudad", requerido: true },
      { nombre: "direccion.estado", etiqueta: "Estado (entidad)", requerido: true },
      { nombre: "coberturaKm", etiqueta: "Cobertura (km)", tipo: "numero", requerido: true },
      { nombre: "estado", etiqueta: "Estado", opciones: ["operativo", "inactivo"] },
    ],
  },
];
