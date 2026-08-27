import {
  obtenerMisSolicitudes,
  actualizarSolicitud,
  eliminarSolicitud,
  obtenerDocentes
} from "../Service/MisSolicitudesService.js";

const contenedor = document.getElementById("contenedor-solicitudes");


let docentesEnMemoria = [];

document.addEventListener("DOMContentLoaded", cargarSolicitudes);

async function cargarSolicitudes() {
  if (!contenedor) {
    return;
  }

  mostrarMensaje("Cargando sus solicitudes...");

  try {
    const solicitudes = await obtenerMisSolicitudes();
    dibujarSolicitudes(solicitudes);
  } catch (error) {
    console.error("No fue posible cargar las solicitudes.", error);
    mostrarMensaje(error.message, true);
  }
}

function dibujarSolicitudes(solicitudes) {
  if (solicitudes.length === 0) {
    mostrarMensaje(
      "Todavía no ha enviado solicitudes. Use el botón Crear solicitud para enviar la primera."
    );
    return;
  }

  contenedor.innerHTML = solicitudes.map(construirTarjeta).join("");
}

function construirTarjeta(solicitud) {

  const acciones = solicitud.editable
    ? `
      <button type="button" class="btn btn-sm btn-outline-primary btn-editar-solicitud"
              data-id="${solicitud.idCita}">
        <i class="bi bi-pencil-square"></i> Editar
      </button>
      <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-solicitud"
              data-id="${solicitud.idCita}">
        <i class="bi bi-trash"></i> Eliminar
      </button>
    `
    : `<small class="text-muted">El docente ya respondió esta solicitud.</small>`;

  return `
    <article class="card shadow-sm mb-3 w-100" id="solicitud-${solicitud.idCita}">
      <div class="card-body">

        <div class="d-flex justify-content-between align-items-start mb-2">
          <h2 class="h6 fw-bold mb-0">${escaparHtml(solicitud.docente)}</h2>
          <span class="badge ${claseEstado(solicitud.estadoApi)}">
            ${escaparHtml(solicitud.estado)}
          </span>
        </div>

        <p class="small text-muted mb-1">
          <i class="bi bi-person"></i> ${escaparHtml(solicitud.estudiante)}
        </p>

        <p class="small text-muted mb-2">
          <i class="bi bi-calendar-event"></i>
          ${escaparHtml(solicitud.fechaTexto)} ${escaparHtml(solicitud.horaTexto)}
        </p>

        <p class="mb-3">${escaparHtml(solicitud.motivo)}</p>

        <div class="d-flex gap-2 flex-wrap">${acciones}</div>

      </div>
    </article>
  `;
}

function claseEstado(estadoApi) {
  const clases = {
    PENDIENTE: "bg-warning text-dark",
    ACEPTADA: "bg-success",
    POSPUESTA: "bg-info text-dark",
    RECHAZADA: "bg-danger",
    CANCELADA: "bg-secondary",
    FINALIZADA: "bg-dark"
  };

  return clases[estadoApi] || "bg-secondary";
}

function mostrarMensaje(texto, esError = false) {
  contenedor.innerHTML = `
    <p class="text-center ${esError ? "text-danger" : "text-muted"} py-5">
      ${escaparHtml(texto)}
    </p>
  `;
}

// Editar
async function abrirEdicion(idCita) {
  const tarjeta = document.getElementById(`solicitud-${idCita}`);

  if (!tarjeta || !window.Swal) {
    avisoError("No se pudo abrir el formulario de edición.");
    return;
  }

  const solicitudes = await obtenerMisSolicitudes();
  const solicitud = solicitudes.find(registro => Number(registro.idCita) === Number(idCita));

  if (!solicitud) {
    avisoError("No se encontró la solicitud.");
    return;
  }

  if (docentesEnMemoria.length === 0) {
    docentesEnMemoria = await obtenerDocentes();
  }

  const opcionesDocente = docentesEnMemoria
    .map(docente => {
      const seleccionado = Number(docente.idDocente) === Number(solicitud.idDocente)
        ? "selected"
        : "";
      return `<option value="${docente.idDocente}" ${seleccionado}>
                ${escaparHtml(docente.nombre)}
              </option>`;
    })
    .join("");

  const resultado = await Swal.fire({
    title: "Editar solicitud",
    html: `
      <div class="text-start">
        <label class="form-label mt-2">Docente</label>
        <select id="swalDocente" class="form-select">${opcionesDocente}</select>

        <label class="form-label mt-2">Fecha</label>
        <input type="date" id="swalFecha" class="form-control"
               value="${solicitud.fecha}" min="${fechaDeHoy()}">

        <label class="form-label mt-2">Hora</label>
        <input type="time" id="swalHora" class="form-control" value="${solicitud.hora || "08:00"}">

        <label class="form-label mt-2">Motivo</label>
        <textarea id="swalMotivo" class="form-control" rows="3"
                  maxlength="250">${escaparHtml(solicitud.motivo)}</textarea>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Guardar cambios",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusConfirm: false,

    // El límite de 250 corresponde a CIT_MOTIVO en la base de datos.
    preConfirm: function () {
      const valores = {
        idDocente: document.getElementById("swalDocente").value,
        fecha: document.getElementById("swalFecha").value,
        hora: document.getElementById("swalHora").value,
        motivo: document.getElementById("swalMotivo").value.trim()
      };

      if (!valores.motivo) {
        Swal.showValidationMessage("Debe indicar el motivo de la visita.");
        return false;
      }

      if (valores.motivo.length > 250) {
        Swal.showValidationMessage("El motivo no puede exceder 250 caracteres.");
        return false;
      }

      if (!valores.fecha || !valores.hora) {
        Swal.showValidationMessage("Debe indicar fecha y hora.");
        return false;
      }

      return valores;
    }
  });

  if (!resultado.isConfirmed) {
    return;
  }

  try {
    await actualizarSolicitud(idCita, resultado.value);
    await cargarSolicitudes();
    avisoExito("La solicitud se actualizó correctamente.");
  } catch (error) {
    avisoError(error.message);
  }
}

// Eliminar
async function confirmarEliminacion(idCita) {
  const confirmado = await confirmarAccion(
    "¿Eliminar la solicitud?",
    "La solicitud se retirará y el docente dejará de verla. Esta acción no se puede deshacer.",
    "Sí, eliminar"
  );

  if (!confirmado) {
    return;
  }

  try {
    await eliminarSolicitud(idCita);
    await cargarSolicitudes();
    avisoExito("La solicitud se eliminó correctamente.");
  } catch (error) {
    avisoError(error.message);
  }
}

// Acciones de las tarjetas
if (contenedor) {
  contenedor.addEventListener("click", function (evento) {
    const botonEditar = evento.target.closest(".btn-editar-solicitud");
    const botonEliminar = evento.target.closest(".btn-eliminar-solicitud");

    if (botonEditar) {
      abrirEdicion(botonEditar.dataset.id);
    } else if (botonEliminar) {
      confirmarEliminacion(botonEliminar.dataset.id);
    }
  });
}


// Avisos
function avisoExito(mensaje) {
  if (window.Swal) {
    Swal.fire({
      icon: "success",
      title: "Listo",
      text: mensaje,
      timer: 1800,
      showConfirmButton: false
    });
  } else {
    alert(mensaje);
  }
}

function avisoError(mensaje) {
  if (window.Swal) {
    Swal.fire({ icon: "error", title: "Ocurrió un problema", text: mensaje });
  } else {
    alert(mensaje);
  }
}

async function confirmarAccion(titulo, mensaje, textoBoton) {
  if (!window.Swal) {
    return window.confirm(`${titulo}\n\n${mensaje}`);
  }

  const resultado = await Swal.fire({
    icon: "warning",
    title: titulo,
    text: mensaje,
    showCancelButton: true,
    confirmButtonText: textoBoton,
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    reverseButtons: true
  });

  return resultado.isConfirmed;
}


// Apoyo
function fechaDeHoy() {
  const hoy = new Date();

  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}