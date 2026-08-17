// Agrega a la pantalla cada comunicado escrito por el docente.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('communications-form');
  const messageInput = document.getElementById('communication-message');
  const communicationsList = document.getElementById('communications-list');

  if (!form || !messageInput || !communicationsList) {
    return;
  }

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

    const communicationCard = document.createElement('article');
    communicationCard.className = 'communication-card';

    const communicationText = document.createElement('p');
    communicationText.className = 'communication-card-text';
    // textContent evita que el texto ingresado pueda convertirse en HTML ejecutable.
    communicationText.textContent = message;

    communicationCard.appendChild(communicationText);
    // Mantiene el orden de envío: cada comunicado nuevo aparece al final de la lista.
    communicationsList.appendChild(communicationCard);

    form.reset();
    messageInput.focus();
  });
});
