import { posponerSolicitud } from "../Service/SolicitudDocenteService.js";

// Lee la solicitud desde los parámetros que envía verSolicitud.html y envía
// la propuesta de reprogramación a la API (antes solo simulaba el éxito).
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formulario-posponer-solicitud');
  const formContent = document.getElementById('contenido-posponer-solicitud');
  const successPanel = document.getElementById('panel-exito-posponer');
  const dateInput = document.getElementById('fecha-sugerida');
  const timeInput = document.getElementById('hora-sugerida');
  const reasonInput = document.getElementById('motivo-reprogramacion');
  const dateOutput = document.getElementById('fecha-exito-posponer');
  const timeOutput = document.getElementById('hora-exito-posponer');
  const submitButton = document.getElementById('btn-enviar-propuesta');
  const closeButton = document.getElementById('btn-cerrar-exito-posponer');

  if (!form || !formContent || !successPanel || !dateInput || !timeInput || !closeButton) return;

  const params = new URLSearchParams(window.location.search);
  const idCita = params.get('solicitud');

  const mostrarError = (mensaje) => {
    if (window.Swal) {
      Swal.fire({ icon: 'error', title: 'Ocurrió un problema', text: mensaje });
    } else {
      alert(mensaje);
    }
  };

  if (!idCita) {
    mostrarError('No se pudo identificar la solicitud. Vuelva a la lista e inténtelo de nuevo.');
    form.querySelectorAll('input, textarea, button').forEach((campo) => { campo.disabled = true; });
    return;
  }

  const getToday = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };
  const validateDateTime = () => {
    const today = getToday();
    const currentTime = getCurrentTime();
    const isToday = dateInput.value === today;
    dateInput.min = today;
    if (isToday) timeInput.min = currentTime;
    else timeInput.removeAttribute('min');
    dateInput.setCustomValidity(dateInput.value && dateInput.value < today
      ? 'La nueva fecha no puede ser anterior a hoy.' : '');
    timeInput.setCustomValidity(isToday && timeInput.value && timeInput.value < currentTime
      ? 'La nueva hora no puede ser anterior a la hora actual.' : '');
  };
  const formatDate = (value) => {
    const [year, month, day] = value.split('-');
    return `${Number(day)}/${Number(month)}/${year}`;
  };
  const formatTime = (value) => {
    const [hourValue, minutes] = value.split(':');
    const hour = Number(hourValue);
    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'P.M.' : 'A.M.'}`;
  };

  validateDateTime();
  dateInput.addEventListener('input', validateDateTime);
  dateInput.addEventListener('change', validateDateTime);
  timeInput.addEventListener('input', validateDateTime);
  timeInput.addEventListener('change', validateDateTime);
  window.setInterval(validateDateTime, 60_000);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    validateDateTime();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitButton.disabled = true;

    try {
      await posponerSolicitud(idCita, dateInput.value, timeInput.value, reasonInput?.value || '');

      dateOutput.textContent = formatDate(dateInput.value);
      timeOutput.textContent = formatTime(timeInput.value);

      formContent.hidden = true;
      successPanel.hidden = false;
      document.body.classList.add('postpone-success-visible');
      closeButton.focus();
    } catch (error) {
      mostrarError(error.message);
    } finally {
      submitButton.disabled = false;
    }
  });

  closeButton.addEventListener('click', () => { window.location.href = 'verSolicitud.html'; });
});
