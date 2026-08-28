import { obtenerPendientes } from "../Service/PendientesService.js";

const tarjetaActividades = document.getElementById("tarjeta-actividades");
const tituloActividades = document.getElementById("titulo-actividades-pendientes");
const saludoDocente = document.getElementById("saludo-docente");
const mensajeBienvenida = document.getElementById("mensaje-bienvenida");

document.addEventListener("DOMContentLoaded", cargarInicio);


document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    cargarInicio();
  }
});

async function cargarInicio() {
  if (!tarjetaActividades) {
    return;
  }

  tarjetaActividades.innerHTML = `
    <p class="task-item mb-0"><span>Cargando actividades...</span></p>
  `;

  try {
    const resumen = await obtenerPendientes();

    escribirSaludo(resumen.nombreDocente);

    // El total va en el título, para saber cuánto hay sin desplegar nada.
    if (tituloActividades) {
      tituloActividades.textContent = resumen.total > 0
        ? `Actividades Pendientes (${resumen.total})`
        : "Actividades Pendientes";
    }

    if (resumen.grupos.length === 0) {
      tarjetaActividades.innerHTML = `
        <p class="task-item mb-0">
          <span><i class="bi bi-check-circle-fill me-2"></i>No tiene actividades pendientes</span>
        </p>
      `;
      return;
    }

    tarjetaActividades.innerHTML = resumen.grupos.map(construirGrupo).join("");
  } catch (error) {
    console.error("No fue posible cargar las actividades pendientes.", error);

    escribirSaludo("");

    tarjetaActividades.innerHTML = `
      <p class="task-item mb-0"><span>No fue posible cargar las actividades.</span></p>
    `;
  }
}

function escribirSaludo(nombreDocente) {
  if (saludoDocente) {

    const hora = new Date().getHours();
    const momento = hora < 12
      ? "¡Buenos días"
      : hora < 19 ? "¡Buenas tardes" : "¡Buenas noches";

    saludoDocente.textContent = nombreDocente
      ? `${momento}, ${nombreDocente}!`
      : "¡Hola!";
  }

  if (mensajeBienvenida) {
    mensajeBienvenida.textContent = "¡Que tengas un excelente día!";
  }
}

// Acordeón
function construirGrupo(grupo) {
  const detalle = grupo.items.map(construirItem).join("");

  return `
    <div class="task-grupo" id="grupo-${grupo.id}">
      <button type="button" class="task-item task-cabecera w-100 border-0 bg-transparent"
              data-grupo="${grupo.id}" aria-expanded="false"
              aria-controls="detalle-${grupo.id}">
        <span>
          <i class="bi ${grupo.icono} ${grupo.color} me-2" aria-hidden="true"></i>
          ${escaparHtml(grupo.titulo)}
        </span>
        <span class="task-cabecera-derecha">
          <span class="badge bg-light text-dark">${grupo.items.length}</span>
          <i class="bi bi-chevron-down task-chevron" aria-hidden="true"></i>
        </span>
      </button>

      <div class="task-detalle" id="detalle-${grupo.id}" hidden>
        ${detalle}
        <div class="task-detalle-pie">
          <a href="${grupo.enlace}" class="btn btn-sm btn-warning rounded-pill fw-bold">
            ${escaparHtml(grupo.textoEnlace)}
          </a>
        </div>
      </div>
    </div>
  `;
}

function construirItem(cita) {
  return `
    <div class="task-detalle-item" id="pendiente-${cita.idCita}">
      <div class="task-detalle-texto">
        <strong>${escaparHtml(cita.asunto)}</strong><br>
        <small>
          ${escaparHtml(cita.estudiante)} ·
          ${escaparHtml(cita.fechaTexto)} ${escaparHtml(cita.horaTexto)}
        </small>
      </div>
      <span class="badge ${claseEstado(cita.estadoApi)}">
        ${escaparHtml(cita.estado)}
      </span>
    </div>
  `;
}

function claseEstado(estadoApi) {
  const clases = {
    PENDIENTE: "bg-warning text-dark",
    ACEPTADA: "bg-success",
    POSPUESTA: "bg-info text-dark",
    FINALIZADA: "bg-dark"
  };

  return clases[estadoApi] || "bg-secondary";
}

if (tarjetaActividades) {
  tarjetaActividades.addEventListener("click", function (evento) {
    const cabecera = evento.target.closest(".task-cabecera");

    if (!cabecera) {
      return;
    }

    const detalle = document.getElementById(`detalle-${cabecera.dataset.grupo}`);

    if (!detalle) {
      return;
    }

    const estaAbierto = cabecera.getAttribute("aria-expanded") === "true";

    tarjetaActividades.querySelectorAll(".task-cabecera").forEach(otra => {
      otra.setAttribute("aria-expanded", "false");
      otra.classList.remove("abierto");
    });

    tarjetaActividades.querySelectorAll(".task-detalle").forEach(otro => {
      otro.hidden = true;
    });

    if (!estaAbierto) {
      cabecera.setAttribute("aria-expanded", "true");
      cabecera.classList.add("abierto");
      detalle.hidden = false;
    }
  });
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}