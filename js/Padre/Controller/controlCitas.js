import { obtenerComunicados } from '../Service/ComunicadosService.js';

document.addEventListener('DOMContentLoaded', () => {
  const communicationsList = document.getElementById('lista-comunicados-padre');

  if (!communicationsList) {
    return;
  }

  const formatDateTime = (value) => {
    if (!value) return { text: 'Fecha no disponible', dateTime: '' };

    const date = new Date(value);
    const formattedDate = new Intl.DateTimeFormat('es-SV', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
    const formattedTime = new Intl.DateTimeFormat('es-SV', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);

    return {
      text: `${formattedDate} - ${formattedTime}`,
      dateTime: value
    };
  };

  const createCard = (communication) => {
    const publication = formatDateTime(communication.fechaPublicacion);
    const article = document.createElement('article');
    article.className = 'appointments-card card border-0';
    article.id = `comunicado-padre-${communication.idComunicado}`;

    const body = document.createElement('div');
    const title = document.createElement('h2');
    const author = document.createElement('p');
    const date = document.createElement('p');
    const time = document.createElement('time');

    body.className = 'card-body';
    title.className = 'appointments-card-title fw-bold mb-0';
    author.className = 'appointments-location mb-0';
    date.className = 'appointments-date mb-0';
    title.textContent = communication.mensaje;
    author.innerHTML = '<i class="bi bi-megaphone-fill appointment-pin" aria-hidden="true"></i><strong>Docente:</strong> ';
    author.append(document.createTextNode(communication.nombreEmpleado || 'Instituto Técnico Ricaldone'));
    time.dateTime = publication.dateTime;
    time.textContent = publication.text;
    date.appendChild(time);
    body.append(title, author, date);
    article.appendChild(body);
    return article;
  };

  const communications = obtenerComunicados();
  communicationsList.innerHTML = '';

  if (communications.length === 0) {
    communicationsList.innerHTML = '<p class="text-center text-secondary mb-0">No hay comunicados publicados.</p>';
    return;
  }

  communications.forEach(communication => {
    communicationsList.appendChild(createCard(communication));
  });
});
