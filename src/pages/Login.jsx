import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import "../styles/Login.css";

export default function Login(){
  const navigate = useNavigate();
  const [modo, setModo] = useState("login");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);
  
  
  function cambiarModo(nuevoModo){
    setModo(nuevoModo);
    setMensaje(null);
  }

  async function manejarEnvio(e){
    e.preventDefault();
    setMensaje(null);
    setCargando(true);

    try {
      if(modo === "login"){
        const sesion = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({correo, password})
        });
        localStorage.setItem("token", sesion.token);
        localStorage.setItem("usuario", JSON.stringify(sesion.usuario));
        navigate("/panel");
      }else{
        const respuesta = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({nombre, correo, password}),
        });
        setMensaje({ tipo: "exito", texto: respuesta.message})
        setPassword("");
      }
    } catch (error) {
      setMensaje({tipo: "error", texto: error.message});
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login">
      <div className="login-tarjeta">
        <div className="login-marca">
          <span className="topbar-logo">N</span>
          <span>NexLog</span>
        </div>

        <div className="login-pestanas">
          <button type="button" className={modo === "login" ? "activa" : ""} onClick={() => cambiarModo("login")}>
            Iniciar Sesion
          </button>
          <button type="button" className={modo === "registro" ? "activa" : ""} onClick={() => cambiarModo("registro")}>
            Solicitar cuenta
          </button>
        </div>

        <form onSubmit={manejarEnvio} className="login-form">
          {modo === "registro" && (
            <>
              <label htmlFor="nombre">Nombre completo</label>
              <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </>
          )}

          <label htmlFor="correo">Correo</label>
          <input id="correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />

          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />

          {modo === "registro" && (
            <p className="login-nota">Tu cuenta quedará pendiente hasta que un administrador la apruebe.</p>
          )}

          {mensaje && (
            <p className={`mensaje mensaje-${mensaje.tipo}`} role="alert">{mensaje.texto}</p>
          )}

          <button type="submit" className="btn-primario" disabled={cargando}>
            {cargando ? "Conectando…" : modo === "login" ? "Entrar" : "Enviar solicitud"}
          </button>
        </form>
      </div>
    </div>
  )
}
