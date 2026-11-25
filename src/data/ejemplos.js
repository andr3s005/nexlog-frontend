export const CATEGORIAS_EJEMPLO = [
  { id: "c1", nombre: "Almacén" },
  { id: "c2", nombre: "Punto de cruce" },
];

export const CENTROS_EJEMPLO = [
  {
    id: "1",
    nombre: "CEDIS Norte",
    descripcion: "Centro principal de la zona norte.",
    categoria: { id: "c1", nombre: "Almacén" },
    ubicacion: { type: "Point", coordinates: [-101.6834, 21.1512] },
  },
  {
    id: "2",
    nombre: "CEDIS Sur",
    descripcion: "Cobertura de la zona sur.",
    categoria: { id: "c1", nombre: "Almacén" },
    ubicacion: { type: "Point", coordinates: [-101.6621, 21.0874] },
  },
];