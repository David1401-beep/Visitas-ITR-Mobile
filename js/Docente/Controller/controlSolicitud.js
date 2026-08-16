// Crea un modal compatible: usa Bootstrap cuando está disponible y una alternativa local si el CDN falla.
function createCompatibleModal(modalElement, options = {}) {
  if (window.bootstrap?.Modal) {
    return window.bootstrap.Modal.getOrCreateInstance(modalElement, options);
  }

  const backdropId = `fallback-backdrop-${modalElement.id}`;

  const hide = () => {
    modalElement.classList.remove('show');
    modalElement.style.display = 'none';
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.removeAttribute('aria-modal');
    document.getElementById(backdropId)?.remove();
    document.body.classList.remove('modal-open');
    modalElement.dispatchEvent(new Event('hidden.bs.modal'));
  };

  modalElement.querySelectorAll('[data-bs-dismiss="modal"]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      hide();
    });
  });

  return {
    show() {
      if (!document.getElementById(backdropId)) {
        const backdrop = document.createElement('div');
        backdrop.id = backdropId;
        backdrop.className = 'modal-backdrop fade show';
        backdrop.addEventListener('click', hide);
        document.body.appendChild(backdrop);
      }

      modalElement.style.display = 'block';
      modalElement.classList.add('show');
      modalElement.removeAttribute('aria-hidden');
      modalElement.setAttribute('aria-modal', 'true');
      document.body.classList.add('modal-open');
      modalElement.querySelector('button, textarea, input, select, a')?.focus();
    },
    hide
  };
}

// Controla la validación y el modal de confirmación del formulario de solicitudes para Docentes.
document.addEventListener('DOMContentLoaded', () => {
  const requestForm = document.querySelector('.request-form');
  const modalElement = document.getElementById('requestSuccessModal');
  const submitBtn = document.getElementById('submit-btn');
  const dateInput = document.getElementById('visit-date');

  // Establece la fecha mínima seleccionable como la fecha actual
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Verificar si venimos en modo edición desde la URL
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

    if (subjectInput && asunto) {
      subjectInput.value = asunto;
    }

    if (dateInput && fecha) {
      if (fecha.includes('-')) {
        dateInput.value = fecha;
      }
    }

    if (timeInput && hora) {
      timeInput.value = hora;
    }

    if (reasonTextarea && motivo) {
      reasonTextarea.value = motivo;
    }

    if (studentSelect && estudiante) {
      for (let option of studentSelect.options) {
        if (option.text.toLowerCase() === estudiante.toLowerCase() || option.value.toLowerCase() === estudiante.toLowerCase()) {
          option.selected = true;
          break;
        }
      }
    }
  }

  // Finaliza si este script se carga en una página sin el formulario.
  if (!requestForm || !modalElement) {
    return;
  }

  const successModal = createCompatibleModal(modalElement, {
    backdrop: 'static',
    keyboard: false
  });

  requestForm.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    requestForm.classList.add('was-validated');

    // El modal sólo se muestra cuando todos los campos obligatorios son válidos.
    if (!requestForm.checkValidity()) {
      return;
    }

    // Si estábamos en modo edición, se actualiza el título del modal de éxito
    const modalTitle = document.getElementById('request-success-title');
    const modalMsg = document.querySelector('.request-success-message');
    if (mode === 'edit' && modalTitle && modalMsg) {
      modalTitle.textContent = 'Solicitud Modificada Correctamente';
      modalMsg.textContent = 'Los cambios en su solicitud se han guardado con éxito.';
    }

    successModal.show();
  });

  // Después de cerrar la confirmación, limpia el formulario o redirige.
  modalElement.addEventListener('hidden.bs.modal', () => {
    if (mode === 'edit') {
      window.history.back();
    } else {
      requestForm.reset();
      requestForm.classList.remove('was-validated');
    }
  });
});
