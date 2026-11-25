import { apiFetch } from "./api.js";

export async function listar(ruta, params = {}) {
  const consulta = new URLSearchParams();
  Object.entries(params).forEach(([clave, valor]) => {
    if (valor) consulta.append(clave, valor);
  });
  const texto = consulta.toString();
  const datos = await apiFetch(texto ? `${ruta}?${texto}` : ruta);
  return datos ?? [];
}

export function crear(ruta, datos) {
  return apiFetch(ruta, { method: "POST", body: JSON.stringify(datos) });
}

export function actualizar(ruta, id, datos) {
  return apiFetch(`${ruta}/${id}`, { method: "PATCH", body: JSON.stringify(datos) });
}

export function eliminar(ruta, id) {
  return apiFetch(`${ruta}/${id}`, { method: "DELETE" });
}
