// Controla la validación y el modal de confirmación del formulario de solicitudes para Docentes.
document.addEventListener('DOMContentLoaded', () => {
  const requestForm = document.querySelector('.request-form');
  const modalElement = document.getElementById('requestSuccessModal');
  const submitBtn = document.getElementById('submit-btn');
  const dateInput = document.getElementById('visit-date');

  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');

  if (mode === 'edit') {
    if (submitBtn) {
      submitBtn.textContent = 'Guardar Cambios';
    }

    const asunto = urlParams.get('asunto');
    const fecha = urlParams.get('fecha');
    const hora = urlParams.get('hora');
    const motivo = urlParams.get('motivo');
    const estudiante = urlParams.get('estudiante');

    const subjectInput = document.getElementById('visit-subject');
    const timeInput = document.getElementById('visit-time');
    const reasonTextarea = document.getElementById('visit-reason');
    const studentSelect = document.getElementById('student') || document.getElementById('teacher');

    if (subjectInput && asunto) subjectInput.value = asunto;
    if (dateInput && fecha && fecha.includes('-')) dateInput.value = fecha;
    if (timeInput && hora) timeInput.value = hora;
    if (reasonTextarea && motivo) reasonTextarea.value = motivo;

    if (studentSelect && estudiante) {
      for (let option of studentSelect.options) {
        if (option.text.toLowerCase() === estudiante.toLowerCase() || option.value.toLowerCase() === estudiante.toLowerCase()) {
          option.selected = true;
          break;
        }
      }
    }
  }

  if (!requestForm || !modalElement || typeof bootstrap === 'undefined') {
    return;
  }

  const successModal = bootstrap.Modal.getOrCreateInstance(modalElement, {
    backdrop: 'static',
    keyboard: false
  });

  requestForm.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    requestForm.classList.add('was-validated');

    if (!requestForm.checkValidity()) {
      return;
    }

    const modalTitle = document.getElementById('request-success-title');
    const modalMsg = document.querySelector('.request-success-message');
    if (mode === 'edit' && modalTitle && modalMsg) {
      modalTitle.textContent = 'Solicitud Modificada Correctamente';
      modalMsg.textContent = 'Los cambios en su solicitud se han guardado con éxito.';
    }

    successModal.show();
  });

  modalElement.addEventListener('hidden.bs.modal', () => {
    if (mode === 'edit') {
      window.history.back();
    } else {
      requestForm.reset();
      requestForm.classList.remove('was-validated');
    }
  });
});
