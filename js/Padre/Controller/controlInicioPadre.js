import { obtenerAvisos } from "../Service/AvisosService.js";
import { obtenerProximasCitas } from "../Service/CitasPadreService.js";

const cuerpoAvisos = document.getElementById("cuerpo-tarjeta-avisos");
const tituloCita = document.getElementById("titulo-cita-pendiente");
const descripcionCita = document.getElementById("descripcion-cita-pendiente");

document.addEventListener("DOMContentLoaded", function () {
  cargarAvisos();
  cargarResumenCitas();
});

document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    cargarAvisos();
    cargarResumenCitas();
  }
});

async function cargarAvisos() {
  if (!cuerpoAvisos) {
    return;
  }

  const titulo = cuerpoAvisos.querySelector("h2");

  try {
    const avisos = await obtenerAvisos(3);

    cuerpoAvisos.innerHTML = "";

    if (titulo) {
      cuerpoAvisos.appendChild(titulo);
    }

    if (avisos.length === 0) {
      const vacio = document.createElement("p");
      vacio.className = "mb-0 text-secondary";
      vacio.textContent = "No hay avisos por el momento.";
      cuerpoAvisos.appendChild(vacio);
      return;
    }

    avisos.forEach((aviso, indice) => {
      const parrafo = document.createElement("p");
      parrafo.className = indice === avisos.length - 1 ? "mb-0" : "";
      parrafo.id = `aviso-${aviso.idComunicado}`;
      parrafo.textContent = aviso.mensaje;

      const firma = document.createElement("small");
      firma.className = "d-block text-secondary";
      firma.textContent = `${aviso.docente} · ${aviso.fechaTexto}`;

      parrafo.appendChild(document.createElement("br"));
      parrafo.appendChild(firma);
      cuerpoAvisos.appendChild(parrafo);
    });
  } catch (error) {
    console.error("No fue posible cargar los avisos.", error);

    cuerpoAvisos.innerHTML = "";

    if (titulo) {
      cuerpoAvisos.appendChild(titulo);
    }

    const mensaje = document.createElement("p");
    mensaje.className = "mb-0 text-secondary";
    mensaje.textContent = "Los avisos no están disponibles en este momento.";
    cuerpoAvisos.appendChild(mensaje);
  }
}

async function cargarResumenCitas() {
  if (!tituloCita || !descripcionCita) {
    return;
  }

  try {
    const proximas = await obtenerProximasCitas();

    if (proximas.length === 0) {
      tituloCita.textContent = "No tienes citas pendientes";
      descripcionCita.innerHTML =
        "Puedes solicitar una reunión<br>desde el botón Crear Solicitud.";
      return;
    }

    const siguiente = proximas[0];

    tituloCita.textContent = proximas.length === 1
      ? "Tienes una cita pendiente:"
      : `Tienes ${proximas.length} citas pendientes:`;

    descripcionCita.innerHTML =
      `${escaparHtml(siguiente.fechaTexto)}<br>a las ${escaparHtml(siguiente.horaTexto)}`;
  } catch (error) {
    console.error("No fue posible cargar el resumen de citas.", error);
  }
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}