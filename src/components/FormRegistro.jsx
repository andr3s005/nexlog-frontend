import { useState } from "react";

function valoresIniciales(campos, inicial) {
  const valores = {};
  campos.forEach((campo) => {
    valores[campo.nombre] = inicial[campo.nombre] ?? (campo.opciones ? campo.opciones[0] : "");
  });
  return valores;
}

export default function FormRegistro({ seccion, inicial, onGuardar, onEliminar, onCancelar }) {
  const [valores, setValores] = useState(() => valoresIniciales(seccion.campos, inicial));
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const esNuevo = !inicial._id;

  function cambiar(nombre, valor) {
    setValores((anteriores) => ({ ...anteriores, [nombre]: valor }));
  }

  async function manejarEnvio(e) {
    e.preventDefault();

    const faltante = seccion.campos.find((c) => c.requerido && !String(valores[c.nombre]).trim());
    if (faltante) {
      setError(`${faltante.etiqueta} es obligatorio.`);
      return;
    }

    const limpios = {};
    seccion.campos.forEach((campo) => {
      const valor = String(valores[campo.nombre]).trim();
      if (valor !== "") limpios[campo.nombre] = valor;
    });

    setError("");
    setGuardando(true);
    try {
      await onGuardar(limpios);
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

      {seccion.campos.map((campo) => (
        <div key={campo.nombre} className="form-registro-campo">
          <label htmlFor={`campo-${campo.nombre}`}>{campo.etiqueta}</label>
          {campo.opciones ? (
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
              value={valores[campo.nombre]}
              onChange={(e) => cambiar(campo.nombre, e.target.value)}
            />
          )}
        </div>
      ))}

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
            <button type="button" className="btn-secundario" onClick={() => setConfirmar(true)}>
              Eliminar
            </button>
          )}
        </div>
      )}
    </form>
  );
}
