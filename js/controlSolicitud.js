// Controla la validación y el modal de confirmación del formulario de solicitudes.
document.addEventListener('DOMContentLoaded', () => {
  // Inicialización y formateo de selectores de Fecha y Hora personalizados (estilo cápsula)
  const dateInput = document.getElementById('visit-date');
  const dateDisplay = document.getElementById('date-display');
  const dateCapsule = document.getElementById('date-capsule');

  const timeInput = document.getElementById('visit-time');
  const timeDisplay = document.getElementById('time-display');
  const timeCapsule = document.getElementById('time-capsule');

  const formatDateDisplay = (val) => {
    if (!val) return '15/6/2026';
    const parts = val.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      return `${day}/${month}/${year}`;
    }
    return val;
  };

  const formatTimeDisplay = (val) => {
    if (!val) return '10:30 A.M';
    const parts = val.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'P.M' : 'A.M';
      hours = hours % 12;
      if (hours === 0) hours = 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    return val;
  };

  if (dateInput && dateDisplay) {
    if (dateInput.value) {
      dateDisplay.textContent = formatDateDisplay(dateInput.value);
    }
    const syncDate = () => {
      dateDisplay.textContent = formatDateDisplay(dateInput.value);
    };
    dateInput.addEventListener('input', syncDate);
    dateInput.addEventListener('change', syncDate);
  }

  if (timeInput && timeDisplay) {
    if (timeInput.value) {
      timeDisplay.textContent = formatTimeDisplay(timeInput.value);
    }
    const syncTime = () => {
      timeDisplay.textContent = formatTimeDisplay(timeInput.value);
    };
    timeInput.addEventListener('input', syncTime);
    timeInput.addEventListener('change', syncTime);
  }

  if (dateCapsule && dateInput) {
    dateCapsule.addEventListener('click', (e) => {
      if (typeof dateInput.showPicker === 'function') {
        try {
          dateInput.showPicker();
        } catch (err) {}
      }
    });
  }

  if (timeCapsule && timeInput) {
    timeCapsule.addEventListener('click', (e) => {
      if (typeof timeInput.showPicker === 'function') {
        try {
          timeInput.showPicker();
        } catch (err) {}
      }
    });
  }

  const requestForm = document.querySelector('.request-form');
  const modalElement = document.getElementById('requestSuccessModal');
  const submitBtn = document.getElementById('submit-btn');

  // Verificar si venimos en modo edición desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');

  if (mode === 'edit') {
    if (submitBtn) {
      submitBtn.textContent = 'Guardar Cambios';
    }

    const encargado = urlParams.get('encargado');
    const docente = urlParams.get('docente');
    const fecha = urlParams.get('fecha');
    const motivo = urlParams.get('motivo');

    const guardianSelect = document.getElementById('guardian');
    const teacherSelect = document.getElementById('teacher');
    const dateInput = document.getElementById('visit-date');
    const reasonTextarea = document.getElementById('visit-reason');

    if (guardianSelect && encargado) {
      for (let option of guardianSelect.options) {
        if (option.text.toLowerCase() === encargado.toLowerCase() || option.value.toLowerCase() === encargado.toLowerCase()) {
          option.selected = true;
          break;
        }
      }
    }

    if (teacherSelect && docente) {
      for (let option of teacherSelect.options) {
        if (option.text.toLowerCase() === docente.toLowerCase() || option.value.toLowerCase() === docente.toLowerCase()) {
          option.selected = true;
          break;
        }
      }
    }

    if (dateInput && fecha) {
      // Intenta convertir texto de fecha (ej. "Jueves 10 de Abril...") o yyyy-mm-dd
      if (fecha.includes('2026') || fecha.includes('2025')) {
        const match = fecha.match(/(\d{1,2})[^\d]+(\d{1,2}|\w+)[^\d]+(\d{4})/);
        if (match) {
          const day = match[1].padStart(2, '0');
          // Mapeo simple de meses si viene en español
          const mesTexto = fecha.toLowerCase();
          let month = '04'; // Abril por defecto
          if (mesTexto.includes('enero')) month = '01';
          if (mesTexto.includes('febrero')) month = '02';
          if (mesTexto.includes('marzo')) month = '03';
          if (mesTexto.includes('abril')) month = '04';
          if (mesTexto.includes('mayo')) month = '05';
          if (mesTexto.includes('junio')) month = '06';
          if (mesTexto.includes('julio')) month = '07';
          if (mesTexto.includes('agosto')) month = '08';
          if (mesTexto.includes('septiembre')) month = '09';
          if (mesTexto.includes('octubre')) month = '10';
          if (mesTexto.includes('noviembre')) month = '11';
          if (mesTexto.includes('diciembre')) month = '12';

          const year = match[3];
          dateInput.value = `${year}-${month}-${day}`;
        } else {
          dateInput.value = '2026-06-10';
        }
      } else {
        dateInput.value = '2026-06-10';
      }
    }

    if (reasonTextarea && motivo) {
      reasonTextarea.value = motivo;
    }
  }

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

    // Si estábamos en modo edición, se actualiza el título del modal de éxito
    const modalTitle = document.getElementById('request-success-title');
    const modalMsg = document.querySelector('.request-success-message');
    if (mode === 'edit' && modalTitle && modalMsg) {
      modalTitle.textContent = 'Solicitud Modificada Correctamente';
      modalMsg.textContent = 'Los cambios en su solicitud se han guardado con éxito.';
    }

    successModal.show();
  });

  // Después de cerrar la confirmación, redirige o prepara el formulario.
  modalElement.addEventListener('hidden.bs.modal', () => {
    if (mode === 'edit') {
      const id = urlParams.get('id') || '1';
      const guardianSelect = document.getElementById('guardian');
      const teacherSelect = document.getElementById('teacher');
      const dateInput = document.getElementById('visit-date');
      const reasonTextarea = document.getElementById('visit-reason');

      const encargado = guardianSelect ? (guardianSelect.options[guardianSelect.selectedIndex]?.text || guardianSelect.value) : '';
      const docente = teacherSelect ? (teacherSelect.options[teacherSelect.selectedIndex]?.text || teacherSelect.value) : '';
      
      // Dar formato legible a la fecha elegida
      let fechaFormatted = dateInput ? dateInput.value : '';
      if (fechaFormatted && fechaFormatted.includes('-')) {
        const parts = fechaFormatted.split('-');
        if (parts.length === 3) {
          const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
          const mesNombre = meses[parseInt(parts[1], 10) - 1] || 'Abril';
          fechaFormatted = `Fecha: ${parts[2]} de ${mesNombre} de ${parts[0]}`;
        }
      }

      const motivo = reasonTextarea ? reasonTextarea.value : '';

      const redirectParams = new URLSearchParams({
        edited: 'true',
        id,
        encargado,
        docente,
        fecha: fechaFormatted,
        motivo
      });

      window.location.href = `solicitudes.html?${redirectParams.toString()}`;
    } else {
      requestForm.reset();
      requestForm.classList.remove('was-validated');
    }
  });
});

