import { obtenerSolicitudesDocente } from '../Service/SolicitudDocenteService.js';

document.addEventListener('DOMContentLoaded', async () => {
  const requestList = document.getElementById('seccion-lista-solicitudes');
  if (!requestList) return;

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const formatDate = (dateValue) => {
    if (!dateValue) return 'No disponible';
    const [year, month, day] = dateValue.split('-').map(Number);
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return 'No disponible';
    const [hourValue, minutes] = timeValue.split(':');
    const hour = Number(hourValue);
    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'P.M' : 'A.M'}`;
  };

  // PENDIENTE y POSPUESTA se muestran juntas en esta lista; el badge
  // distingue si es una solicitud nueva o una reprogramación del encargado.
  const claseBadgeEstado = (estadoApi) => (estadoApi === 'POSPUESTA' ? 'bg-info text-dark' : 'bg-warning text-dark');

  const renderRequests = (requests) => {
    requestList.innerHTML = '';

    if (requests.length === 0) {
      requestList.innerHTML = `
        <p class="text-center text-secondary py-5" id="mensaje-solicitudes-vacias">
          No hay solicitudes pendientes.
        </p>
      `;
      return;
    }

    requests.forEach((request) => {
      const reviewParameters = new URLSearchParams({
        solicitud: String(request.idCita),
        nombre: request.nombreEncargado,
        estudiante: request.nombreEstudiante,
        motivo: request.motivo,
        descripcion: request.descripcion,
        fecha: request.fecha,
        hora: request.hora
      });
      const postponeParameters = new URLSearchParams({
        solicitud: String(request.idCita),
        nombre: request.nombreEncargado
      });

      requestList.innerHTML += `
        <article class="request-summary-card" id="tarjeta-solicitud-${request.idCita}"
          data-id-cita="${request.idCita}">
          <div class="d-flex justify-content-between align-items-start">
            <h2 class="request-summary-student fw-bold mb-0" id="nombre-solicitante-${request.idCita}">
              ${escapeHtml(request.nombreEncargado)}
            </h2>
            <span class="badge ${claseBadgeEstado(request.estadoApi)}">${escapeHtml(request.estado)}</span>
          </div>

          <dl class="request-summary-details" id="detalles-solicitud-${request.idCita}">
            <div id="contenedor-estudiante-${request.idCita}">
              <dt id="etiqueta-estudiante-${request.idCita}">Estudiante:</dt>
              <dd id="estudiante-solicitud-${request.idCita}">${escapeHtml(request.nombreEstudiante)}</dd>
            </div>
            <div id="contenedor-motivo-${request.idCita}">
              <dt id="etiqueta-motivo-${request.idCita}">Motivo:</dt>
              <dd id="motivo-solicitud-${request.idCita}">${escapeHtml(request.motivo)}</dd>
            </div>
            <div id="contenedor-fecha-${request.idCita}">
              <dt id="etiqueta-fecha-${request.idCita}">Fecha:</dt>
              <dd id="fecha-solicitud-${request.idCita}">${escapeHtml(formatDate(request.fecha))}</dd>
            </div>
            <div id="contenedor-hora-${request.idCita}">
              <dt id="etiqueta-hora-${request.idCita}">Hora:</dt>
              <dd id="hora-solicitud-${request.idCita}">${escapeHtml(formatTime(request.hora))}</dd>
            </div>
          </dl>

          <div class="request-summary-actions" id="acciones-solicitud-${request.idCita}">
            <a class="request-list-action request-list-review" id="btn-revisar-solicitud-${request.idCita}"
              href="revisarSolicitud.html?${reviewParameters.toString()}">
              Revisar
            </a>
            <a class="request-list-action request-list-postpone" id="btn-posponer-solicitud-${request.idCita}"
              href="posponerSolicitud.html?${postponeParameters.toString()}">
              Posponer
            </a>
          </div>
        </article>
      `;
    });
  };

  requestList.innerHTML = `
    <p class="text-center text-secondary py-5" id="mensaje-cargando-solicitudes">
      Cargando solicitudes...
    </p>
  `;

  try {
    renderRequests(await obtenerSolicitudesDocente());
  } catch (error) {
    requestList.innerHTML = `
      <div class="text-center py-5" id="mensaje-error-solicitudes">
        <p class="text-secondary mb-2">No se pudieron cargar las solicitudes.</p>
      </div>
    `;
  }
});
