// Control de interactividad, edición, eliminación y almacenamiento de la lista de solicitudes
document.addEventListener('DOMContentLoaded', () => {
    let cardToDelete = null;
    const deleteModalEl = document.getElementById('deleteConfirmModal');
    const deleteSuccessModalEl = document.getElementById('deleteSuccessModal');

    const deleteModal = deleteModalEl && typeof bootstrap !== 'undefined' ? bootstrap.Modal.getOrCreateInstance(deleteModalEl) : null;
    const deleteSuccessModal = deleteSuccessModalEl && typeof bootstrap !== 'undefined' ? bootstrap.Modal.getOrCreateInstance(deleteSuccessModalEl) : null;

    // Guardar cambios si venimos de editar
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('edited') === 'true') {
        const id = urlParams.get('id');
        const encargado = urlParams.get('encargado');
        const docente = urlParams.get('docente');
        const fecha = urlParams.get('fecha');
        const motivo = urlParams.get('motivo');

        if (id) {
            let solicitudes = JSON.parse(localStorage.getItem('solicitudes_data') || '{}');
            solicitudes[id] = { id, encargado, docente, fecha, motivo };
            localStorage.setItem('solicitudes_data', JSON.stringify(solicitudes));
        }
    }

    // Aplicar los cambios guardados a las tarjetas existentes
    const stored = JSON.parse(localStorage.getItem('solicitudes_data') || '{}');
    Object.keys(stored).forEach(id => {
        const data = stored[id];
        const card = document.querySelector(`.solicitud-card[data-id="${id}"]`);
        if (card) {
            const datos = card.querySelectorAll('.solicitud-dato');
            if (datos.length >= 4) {
                datos[0].innerHTML = `<strong>Encargado:</strong> ${data.encargado}`;
                datos[1].innerHTML = `<strong>Docente:</strong> ${data.docente}`;
                datos[2].innerHTML = `<strong>Fecha:</strong> ${data.fecha}`;
                datos[3].innerHTML = `<strong>Motivo:</strong> ${data.motivo}`;
            }
        }
    });

    // Evento para los botones Editar
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.solicitud-card');
            const id = card.getAttribute('data-id') || '1';
            const titulo = card.querySelector('.solicitud-titulo')?.innerText || '';
            const datos = card.querySelectorAll('.solicitud-dato');
            
            let encargado = '', docente = '', fecha = '', motivo = '';
            datos.forEach(d => {
                const text = d.innerText;
                if (text.includes('Encargado:')) encargado = text.replace('Encargado:', '').trim();
                if (text.includes('Docente:')) docente = text.replace('Docente:', '').trim();
                if (text.includes('Fecha:')) fecha = text.replace('Fecha:', '').trim();
                if (text.includes('Motivo:')) motivo = text.replace('Motivo:', '').trim();
            });

            const params = new URLSearchParams({
                mode: 'edit',
                id,
                titulo,
                encargado,
                docente,
                fecha,
                motivo
            });

            window.location.href = `CrearSolicitud.html?${params.toString()}`;
        });
    });

    // Evento para los botones Eliminar
    document.querySelectorAll('.btn-cancelar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            cardToDelete = e.target.closest('.solicitud-card');
            
            // Extraer datos de la tarjeta para el modal
            const datos = cardToDelete.querySelectorAll('.solicitud-dato');
            if (datos.length >= 3) {
                document.getElementById('modalEncargado').innerHTML = datos[0].innerHTML;
                document.getElementById('modalDocente').innerHTML = datos[1].innerHTML;
                document.getElementById('modalFecha').innerHTML = datos[2].innerHTML;
            }

            if (deleteModal) {
                deleteModal.show();
            }
        });
    });

    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', () => {
            if (cardToDelete) {
                const id = cardToDelete.getAttribute('data-id');
                if (id) {
                    let solicitudes = JSON.parse(localStorage.getItem('solicitudes_data') || '{}');
                    delete solicitudes[id];
                    localStorage.setItem('solicitudes_data', JSON.stringify(solicitudes));
                }
                cardToDelete.remove();
                cardToDelete = null;
            }

            if (deleteModal) {
                deleteModal.hide();
            }

            if (deleteModalEl && deleteSuccessModal) {
                deleteModalEl.addEventListener('hidden.bs.modal', function onHidden() {
                    deleteModalEl.removeEventListener('hidden.bs.modal', onHidden);
                    deleteSuccessModal.show();
                });
            }
        });
    }
});
