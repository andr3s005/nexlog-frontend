import { useState } from "react";

// Lee un valor aunque el nombre tenga puntos: leer(centro, "direccion.calle").
function leer(objeto, ruta) {
  return ruta.split(".").reduce((valor, parte) => (valor == null ? undefined : valor[parte]), objeto);
}

// Escribe un valor creando los objetos intermedios: escribir(datos, "direccion.calle", "Madero 412").
function escribir(objeto, ruta, valor) {
  const partes = ruta.split(".");
  let actual = objeto;
  partes.slice(0, -1).forEach((parte) => {
    actual[parte] = actual[parte] ?? {};
    actual = actual[parte];
  });
  actual[partes[partes.length - 1]] = valor;
}

function etiquetaDe(item) {
  return item.nombre ?? item.placa ?? item._id;
}

function valoresIniciales(campos, inicial) {
  const valores = {};
  campos.forEach((campo) => {
    const valor = leer(inicial, campo.nombre);
    if (campo.relacion) {
      valores[campo.nombre] = valor?._id ?? valor ?? "";
    } else if (campo.opciones) {
      valores[campo.nombre] = valor ?? campo.opciones[0];
    } else {
      valores[campo.nombre] = valor ?? "";
    }
  });
  return valores;
}

export default function FormRegistro({ seccion, inicial, colecciones, punto, onGuardar, onEliminar, onCancelar }) {
  const [valores, setValores] = useState(() => valoresIniciales(seccion.campos, inicial));
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const esNuevo = !inicial._id;

  function cambiar(nombre, valor) {
    setValores((anteriores) => ({ ...anteriores, [nombre]: valor }));
  }

  // Convierte lo escrito en el formulario al cuerpo que espera el backend.
  function armarDatos() {
    const datos = {};

    for (const campo of seccion.campos) {
      const crudo = valores[campo.nombre];
      const valor = typeof crudo === "string" ? crudo.trim() : crudo;

      if (campo.requerido && (valor === "" || valor == null)) {
        throw new Error(`${campo.etiqueta} es obligatorio.`);
      }

      if (campo.relacion) {
        escribir(datos, campo.nombre, valor || null);
      } else if (campo.tipo === "numero") {
        if (valor === "") continue;
        const numero = Number(valor);
        if (!Number.isFinite(numero) || numero <= 0) {
          throw new Error(`${campo.etiqueta} debe ser un número mayor que cero.`);
        }
        escribir(datos, campo.nombre, numero);
      } else if (valor !== "") {
        escribir(datos, campo.nombre, valor);
      }
    }

    if (seccion.punto) {
      if (!punto) throw new Error("Haz clic en el mapa para elegir la ubicación.");
      datos[seccion.punto] = { type: "Point", coordinates: [punto.lng, punto.lat] };
    }

    return datos;
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");

    let datos;
    try {
      datos = armarDatos();
    } catch (err) {
      setError(err.message);
      return;
    }

    setGuardando(true);
    try {
      await onGuardar(datos);
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  }

  async function manejarEliminar() {
    setGuardando(true);
    try {
      await onEliminar();
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  }

  return (
    <form className="form-registro" onSubmit={manejarEnvio}>
      <div className="detalle-encabezado">
        <h2>{esNuevo ? "Nuevo" : "Editar"} · {seccion.label}</h2>
        <button type="button" className="detalle-cerrar" aria-label="Cerrar" onClick={onCancelar}>
          ×
        </button>
      </div>

      {esNuevo && seccion.notaNuevo && <p className="detalle-nota">{seccion.notaNuevo}</p>}

      {seccion.campos.map((campo) => (
        <div key={campo.nombre} className="form-registro-campo">
          <label htmlFor={`campo-${campo.nombre}`}>{campo.etiqueta}</label>

          {campo.relacion ? (
            <select
              id={`campo-${campo.nombre}`}
              value={valores[campo.nombre]}
              onChange={(e) => cambiar(campo.nombre, e.target.value)}
            >
              <option value="">{campo.requerido ? "Elige una opción" : "Sin asignar"}</option>
              {colecciones[campo.relacion].map((item) => (
                <option key={item._id} value={item._id}>{etiquetaDe(item)}</option>
              ))}
            </select>
          ) : campo.opciones ? (
            <select
              id={`campo-${campo.nombre}`}
              value={valores[campo.nombre]}
              onChange={(e) => cambiar(campo.nombre, e.target.value)}
            >
              {campo.opciones.map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
          ) : (
            <input
              id={`campo-${campo.nombre}`}
              type={campo.tipo === "numero" ? "number" : "text"}
              step={campo.tipo === "numero" ? "any" : undefined}
              value={valores[campo.nombre]}
              onChange={(e) => cambiar(campo.nombre, e.target.value)}
            />
          )}
        </div>
      ))}

      {seccion.punto && (
        <div className="form-registro-campo">
          <span className="form-registro-etiqueta">Ubicación en el mapa</span>
          <span className={punto ? "form-registro-punto" : "form-registro-punto vacio"}>
            {punto ? `${punto.lat.toFixed(4)}, ${punto.lng.toFixed(4)}` : "Sin elegir"}
          </span>
          <span className="detalle-nota">Haz clic en el mapa para elegir o mover el punto.</span>
        </div>
      )}

      {error && <p className="mensaje mensaje-error" role="alert">{error}</p>}

      <div className="form-acciones">
        <button type="submit" className="btn-primario" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" className="btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
      </div>

      {!esNuevo && (
        <div className="form-registro-eliminar">
          {confirmar ? (
            <>
              <span>¿Eliminar este registro?</span>
              <div className="form-acciones">
                <button type="button" className="btn-peligro" onClick={manejarEliminar} disabled={guardando}>
                  Sí, eliminar
                </button>
                <button type="button" className="btn-secundario" onClick={() => setConfirmar(false)}>
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="btn-peligro" onClick={() => setConfirmar(true)}>
              Eliminar
            </button>
          )}
        </div>
      )}
    </form>
  );
}
