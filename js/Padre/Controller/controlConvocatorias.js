// Controla las respuestas del encargado y prepara los datos que después recibirá la API.
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'visitasItr.convocatorias.estado.v1';
  const list = document.getElementById('lista-convocatorias');
  const postponeModal = document.getElementById('modal-posponer-convocatoria');
  const resultModal = document.getElementById('modal-resultado-convocatoria');
  const postponeForm = document.getElementById('formulario-posponer-convocatoria');
  const convocationIdInput = document.getElementById('id-convocatoria-posponer');
  const dateInput = document.getElementById('nueva-fecha-convocatoria');
  const timeInput = document.getElementById('nueva-hora-convocatoria');
  const reasonInput = document.getElementById('motivo-posponer-convocatoria');
  const resultTitle = document.getElementById('titulo-resultado-convocatoria');
  const resultMessage = document.getElementById('mensaje-resultado-convocatoria');
  const liveRegion = document.getElementById('anuncios-convocatorias');

  if (!list || !postponeModal || !resultModal || !postponeForm) {
    return;
  }

  const statusLabels = {
    pendiente: 'Pendiente',
    aceptada: 'Aceptada',
    pospuesta: 'Pospuesta',
  };

  const getCard = (convocationId) => document.getElementById(`convocatoria-${convocationId}`);

  const getToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const readSavedStates = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (error) {
      return {};
    }
  };

  const saveState = (convocationId, state) => {
    const states = readSavedStates();
    states[convocationId] = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  };

  const formatDate = (dateValue) => {
    const date = new Date(`${dateValue}T00:00:00`);
    const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    return `${weekdays[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const formatTime = (timeValue) => {
    const [hourValue, minutes] = timeValue.split(':');
    const hour = Number(hourValue);
    const hour12 = hour % 12 || 12;
    const period = hour >= 12 ? 'P.M.' : 'A.M.';

    return `${hour12}:${minutes} ${period}`;
  };

  // Este objeto tiene nombres estables para poder enviarlo luego mediante fetch a la API.
  const buildApiPayload = (card, status, extraData = {}) => ({
    convocatoriaId: Number(card.dataset.convocatoriaId),
    estudianteId: Number(card.dataset.estudianteId),
    asunto: card.querySelector('[data-api-field="asunto"]')?.textContent.trim() || '',
    fecha: card.querySelector('[data-api-field="fecha"]')?.dateTime || '',
    hora: card.querySelector('[data-api-field="hora"]')?.dateTime || '',
    descripcion: card.querySelector('[data-api-field="descripcion"]')?.textContent.trim() || '',
    estudianteNombre: card.querySelector('[data-api-field="estudianteNombre"]')?.textContent.trim() || '',
    estado: status,
    ...extraData,
  });

  const emitApiReadyEvent = (payload) => {
    // La futura integración puede escuchar este evento y reemplazar localStorage por fetch().
    window.dispatchEvent(new CustomEvent('convocatoria:actualizada', { detail: payload }));
  };

  const openModal = (modal, elementToFocus) => {
    modal.hidden = false;
    document.body.classList.add('convocation-modal-open');
    window.setTimeout(() => elementToFocus?.focus(), 0);
  };

  const closeModal = (modal) => {
    modal.hidden = true;
    if (postponeModal.hidden && resultModal.hidden) {
      document.body.classList.remove('convocation-modal-open');
    }
  };

  const showResult = (title, message) => {
    resultTitle.textContent = title;
    resultMessage.textContent = message;
    openModal(resultModal, document.getElementById('btn-cerrar-resultado-convocatoria'));
  };

  const applyState = (card, state, announce = false) => {
    const status = state.estado || 'pendiente';
    const statusElement = card.querySelector('[data-api-field="estado"]');
    const buttons = card.querySelectorAll('[data-action]');

    card.dataset.estado = status;
    card.classList.toggle('is-accepted', status === 'aceptada');
    card.classList.toggle('is-postponed', status === 'pospuesta');
    statusElement.textContent = statusLabels[status] || status;

    if (status === 'pospuesta' && state.nuevaFecha && state.nuevaHora) {
      const dateElement = card.querySelector('[data-api-field="fecha"]');
      const timeElement = card.querySelector('[data-api-field="hora"]');
      dateElement.dateTime = state.nuevaFecha;
      dateElement.textContent = formatDate(state.nuevaFecha);
      timeElement.dateTime = state.nuevaHora;
      timeElement.textContent = formatTime(state.nuevaHora);
    }

    buttons.forEach((button) => {
      button.disabled = status !== 'pendiente';
    });

    if (announce) {
      liveRegion.textContent = `La convocatoria ${card.dataset.convocatoriaId} ahora está ${statusLabels[status].toLowerCase()}.`;
    }
  };

  // Restaura las decisiones aunque se recargue la página.
  const savedStates = readSavedStates();
  document.querySelectorAll('.convocation-card').forEach((card) => {
    const savedState = savedStates[card.dataset.convocatoriaId];
    if (savedState) {
      applyState(card, savedState);
    }
  });

  dateInput.min = getToday();

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) {
      return;
    }

    const convocationId = button.dataset.convocatoriaId;
    const card = getCard(convocationId);

    if (!card) {
      return;
    }

    if (button.dataset.action === 'aceptar') {
      const state = {
        estado: 'aceptada',
        actualizadoEn: new Date().toISOString(),
      };
      applyState(card, state, true);
      saveState(convocationId, state);

      const payload = buildApiPayload(card, 'aceptada', {
        actualizadoEn: state.actualizadoEn,
      });
      emitApiReadyEvent(payload);
      showResult('Convocatoria aceptada', 'Tu aceptación fue registrada correctamente.');
      return;
    }

    postponeForm.reset();
    convocationIdInput.value = convocationId;
    dateInput.min = getToday();
    openModal(postponeModal, dateInput);
  });

  postponeForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!postponeForm.checkValidity()) {
      postponeForm.reportValidity();
      return;
    }

    const convocationId = convocationIdInput.value;
    const card = getCard(convocationId);
    if (!card) {
      return;
    }

    const state = {
      estado: 'pospuesta',
      nuevaFecha: dateInput.value,
      nuevaHora: timeInput.value,
      motivo: reasonInput.value.trim(),
      actualizadoEn: new Date().toISOString(),
    };

    applyState(card, state, true);
    saveState(convocationId, state);

    const payload = buildApiPayload(card, 'pospuesta', {
      nuevaFecha: state.nuevaFecha,
      nuevaHora: state.nuevaHora,
      motivoReprogramacion: state.motivo,
      actualizadoEn: state.actualizadoEn,
    });
    emitApiReadyEvent(payload);

    closeModal(postponeModal);
    showResult('Propuesta enviada', 'La nueva fecha y hora fueron registradas correctamente.');
  });

  document.getElementById('btn-cerrar-modal-posponer').addEventListener('click', () => {
    closeModal(postponeModal);
  });

  document.getElementById('btn-cerrar-resultado-convocatoria').addEventListener('click', () => {
    closeModal(resultModal);
  });

  document.querySelectorAll('.convocation-modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!postponeModal.hidden) closeModal(postponeModal);
      if (!resultModal.hidden) closeModal(resultModal);
    }
  });
});
