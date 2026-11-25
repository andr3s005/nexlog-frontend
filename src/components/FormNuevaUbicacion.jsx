import { useState } from "react";

export default function FormNuevaUbicacion({ punto, categorias, onGuardar, onCancelar, inicial = null, titulo = "Nuevo centro" }){
    const [nombre, setNombre] = useState(inicial?.nombre ?? "");
    const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? "");
    const [categoriaId, setCategoriaId] = useState(inicial?.categoria?.id ?? "");
    const [error, setError] = useState("");

    function manejarEnvio(e){
        e.preventDefault();

        if(nombre.trim().length < 5){
            setError("El nombre debe tener al menos 5 caracteres");
            return;
        }
        if (descripcion.trim().length < 10) {
            setError("La descripción debe tener al menos 10 caracteres.");
            return;
        }
        if (!categoriaId) {
            setError("Elige una categoría.");
            return;
        }

        const categoria = categorias.find((c) => c.id === categoriaId);

        if (inicial) {
            onGuardar({ ...inicial, nombre: nombre.trim(), descripcion: descripcion.trim(), categoria });
            return;
        }

        onGuardar({
            id: String(Date.now()),
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            categoria,
            ubicacion: {type: "Point", coordinates: [punto.lng, punto.lat]},
        });
    }

    return (
        <form className="form-popup" onSubmit={manejarEnvio}>
            <strong>{titulo}</strong>
            <small>{punto.lat.toFixed(4)}, {punto.lng.toFixed(4)}</small>

            <label htmlFor="nu-nombre">Nombre</label>
            <input id="nu-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}/>

            <label htmlFor="nu-descripcion">Descripción</label>
            <input id="nu-descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />

            <label htmlFor="nu-categoria">Categoría</label>
            <select id="nu-categoria" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                <option value="">Elige una categoría</option>
                {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
            </select>

            {error && <p className="form-error" role="alert">{error}</p>}

            <div className="form-acciones">
                <button type="submit" className="btn-primario">Guardar</button>
                <button type="button" className="btn-secundario" onClick={onCancelar}>Cancelar</button>
            </div>
        </form>
    );
}