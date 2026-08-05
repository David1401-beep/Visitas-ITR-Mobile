// Controla la validación y el modal de confirmación del formulario de solicitudes.
document.addEventListener('DOMContentLoaded', () => {
  const requestForm = document.querySelector('.request-form');
  const modalElement = document.getElementById('requestSuccessModal');

  // Finaliza silenciosamente si este script se carga en una página sin el formulario.
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

    // El modal sólo se muestra cuando todos los campos obligatorios son válidos.
    if (!requestForm.checkValidity()) {
      return;
    }

    successModal.show();
  });

  // Después de cerrar la confirmación, prepara el formulario para una nueva solicitud.
  modalElement.addEventListener('hidden.bs.modal', () => {
    requestForm.reset();
    requestForm.classList.remove('was-validated');
  });
});
