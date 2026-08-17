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
