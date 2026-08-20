// Controla el envío visual de la propuesta mientras se prepara la conexión con la API.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.postpone-card');
  const formContent = document.querySelector('.postpone-content');
  const successPanel = document.getElementById('postpone-success-panel');
  const dateInput = document.getElementById('postpone-date');
  const timeInput = document.getElementById('postpone-time');
  const dateOutput = document.getElementById('postpone-success-date');
  const timeOutput = document.getElementById('postpone-success-time');
  const closeButton = document.getElementById('postpone-success-close');

  if (!form || !formContent || !successPanel || !dateInput || !timeInput || !closeButton) {
    return;
  }

  // Impide proponer una fecha anterior al día actual.
  dateInput.min = new Date().toISOString().split('T')[0];

  const formatDate = (value) => {
    const [year, month, day] = value.split('-');
    return `${Number(day)}/${Number(month)}/${year}`;
  };

  const formatTime = (value) => {
    const [hourValue, minutes] = value.split(':');
    const hour = Number(hourValue);
    const period = hour >= 12 ? 'P.M' : 'A.M';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    dateOutput.textContent = formatDate(dateInput.value);
    timeOutput.textContent = formatTime(timeInput.value);

    formContent.hidden = true;
    successPanel.hidden = false;
    document.body.classList.add('postpone-success-visible');
    closeButton.focus();
  });

  // Después de confirmar, vuelve al listado principal de solicitudes.
  closeButton.addEventListener('click', () => {
    window.location.href = 'verSolicitud.html';
  });
});

// Validación del formulario actual de reprogramación.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formulario-posponer-solicitud');
  const formContent = document.getElementById('contenido-posponer-solicitud');
  const successPanel = document.getElementById('panel-exito-posponer');
  const dateInput = document.getElementById('fecha-sugerida');
  const timeInput = document.getElementById('hora-sugerida');
  const dateOutput = document.getElementById('fecha-exito-posponer');
  const timeOutput = document.getElementById('hora-exito-posponer');
  const closeButton = document.getElementById('btn-cerrar-exito-posponer');
  if (!form || !formContent || !successPanel || !dateInput || !timeInput || !closeButton) return;

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
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    validateDateTime();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    dateOutput.textContent = formatDate(dateInput.value);
    timeOutput.textContent = formatTime(timeInput.value);
    formContent.hidden = true;
    successPanel.hidden = false;
    document.body.classList.add('postpone-success-visible');
    closeButton.focus();
  });
  closeButton.addEventListener('click', () => { window.location.href = 'verSolicitud.html'; });
});
