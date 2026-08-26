import {
  obtenerComunicados,
  publicarComunicado
} from '../Service/ComunicadosService.js';

// Guarda localmente y muestra cada comunicado escrito por el docente.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formulario-comunicados');
  const messageInput = document.getElementById('mensaje-comunicado');
  const communicationsList = document.getElementById('lista-comunicados');
  const submitButton = document.getElementById('btn-enviar-comunicado');

  if (!form || !messageInput || !communicationsList) {
    return;
  }

  const formatDateTime = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('es-SV', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  };

  const createCard = (communication) => {
    const communicationCard = document.createElement('article');
    const communicationText = document.createElement('p');
    const communicationMeta = document.createElement('small');

    communicationCard.className = 'communication-card';
    communicationCard.id = `comunicado-docente-${communication.idComunicado}`;
    communicationText.className = 'communication-card-text';
    communicationMeta.className = 'communication-card-meta';
    communicationText.textContent = communication.mensaje;
    communicationMeta.textContent = `${communication.nombreEmpleado || 'Docente'} · ${formatDateTime(communication.fechaPublicacion)}`;
    communicationCard.append(communicationText, communicationMeta);
    return communicationCard;
  };

  const renderCommunications = (communications) => {
    communicationsList.innerHTML = '';

    if (communications.length === 0) {
      communicationsList.innerHTML = '<p class="text-center text-secondary mb-0">No hay comunicados publicados.</p>';
      return;
    }

    communications.forEach(communication => {
      communicationsList.appendChild(createCard(communication));
    });
  };

  messageInput.addEventListener('input', () => {
    // Quita el mensaje de error personalizado tan pronto se vuelve a escribir.
    messageInput.setCustomValidity('');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const message = messageInput.value.trim();

    if (!message) {
      messageInput.setCustomValidity('Escribe un comunicado antes de enviarlo.');
      messageInput.reportValidity();
      return;
    }

    submitButton.disabled = true;
    try {
      const communication = publicarComunicado(message);
      const emptyMessage = communicationsList.querySelector('p.text-secondary');
      emptyMessage?.remove();
      communicationsList.prepend(createCard(communication));
      form.reset();
      
      // Mostrar modal de éxito usando Bootstrap
      const successModalEl = document.getElementById('modal-exito-comunicado');
      if (successModalEl && typeof bootstrap !== 'undefined') {
        const successModal = bootstrap.Modal.getOrCreateInstance(successModalEl);
        successModal.show();
      }
      
    } catch (error) {
      alert('No se pudo guardar el comunicado en este navegador.');
    } finally {
      submitButton.disabled = false;
    }
  });

  // Al cerrar el modal, devolver foco
  const successModalEl = document.getElementById('modal-exito-comunicado');
  if (successModalEl) {
    successModalEl.addEventListener('hidden.bs.modal', () => {
      messageInput.focus();
    });
  }

  renderCommunications(obtenerComunicados());
});
