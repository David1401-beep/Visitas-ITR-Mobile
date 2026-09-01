import {
  iniciarSesion,
  haySesionActiva,
  destinoSegunRol
} from "./js/sesionService.js";

document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("formulario-inicio-sesion");
  const inputCorreo = document.getElementById("correo-usuario");
  const inputPassword = document.getElementById("contrasena-usuario");
  const mensaje = document.getElementById("mensaje-inicio-sesion");
  const boton = document.getElementById("btn-iniciar-sesion");

  if (!formulario || !inputCorreo || !inputPassword) {
    return;
  }

  if (haySesionActiva()) {
    window.location.replace(destinoSegunRol());
    return;
  }

  formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    limpiarMensaje();

    if (!formulario.checkValidity()) {
      formulario.reportValidity();
      return;
    }

    boton.disabled = true;
    const textoOriginal = boton.textContent;
    boton.textContent = "Verificando...";

    try {
      const sesion = await iniciarSesion(inputCorreo.value, inputPassword.value);
      window.location.replace(sesion.destino);
    } catch (error) {
      mostrarError(error.message);
      inputPassword.value = "";
      inputPassword.focus();
    } finally {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }
  });

  inputCorreo.addEventListener("input", limpiarMensaje);
  inputPassword.addEventListener("input", limpiarMensaje);

  function limpiarMensaje() {
    if (mensaje) {
      mensaje.textContent = "";
    }
  }

  function mostrarError(texto) {
    if (mensaje) {
      mensaje.textContent = texto;
    }

    if (window.Swal) {
      Swal.fire({
        icon: "error",
        title: "No se pudo iniciar sesión",
        text: texto
      });
    }
  }
});