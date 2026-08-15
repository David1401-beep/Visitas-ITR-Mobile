// Controla la lectura de parámetros URL, actualización de datos y modales de aceptación y rechazo para Docentes.
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const nombre = params.get('nombre') || 'Jholman Alegria';
    const motivo = params.get('motivo') || 'Reunion Academica';
    const descripcion = params.get('descripcion') || 'Quisiera aclarar unas dudas con respecto a las notas de mi hijo';

    const elemNombre = document.getElementById('review-nombre');
    const elemMotivo = document.getElementById('review-motivo');
    const elemDescripcion = document.getElementById('review-descripcion');

    if (elemNombre) elemNombre.textContent = nombre;
    if (elemMotivo) elemMotivo.textContent = motivo;
    if (elemDescripcion) elemDescripcion.textContent = descripcion;

    // Actualizar nombre en los modales
    const modalNombreAceptar = document.getElementById('modal-solicitante-nombre');
    const modalTextoAceptar = document.getElementById('modal-solicitante-texto');
    if (modalNombreAceptar) modalNombreAceptar.textContent = nombre;
    if (modalTextoAceptar) modalTextoAceptar.textContent = nombre;

    const modalNombreRechazo = document.getElementById('modal-solicitante-rechazo-nombre');
    if (modalNombreRechazo) modalNombreRechazo.textContent = nombre;

    // Modal de Aceptar
    const btnAceptar = document.getElementById('btn-aceptar-solicitud');
    const acceptModalEl = document.getElementById('acceptSuccessModal');
    if (btnAceptar && acceptModalEl && typeof bootstrap !== 'undefined') {
        const acceptModal = bootstrap.Modal.getOrCreateInstance(acceptModalEl);
        btnAceptar.addEventListener('click', (e) => {
            e.preventDefault();
            acceptModal.show();
        });

        acceptModalEl.addEventListener('hidden.bs.modal', () => {
            window.location.href = 'solicitudes.html';
        });
    }

    // Modal de Rechazar
    const btnRechazar = document.getElementById('btn-rechazar-solicitud');
    const rejectModalEl = document.getElementById('rejectSuccessModal');
    if (btnRechazar && rejectModalEl && typeof bootstrap !== 'undefined') {
        const rejectModal = bootstrap.Modal.getOrCreateInstance(rejectModalEl);
        btnRechazar.addEventListener('click', (e) => {
            e.preventDefault();
            rejectModal.show();
        });

        rejectModalEl.addEventListener('hidden.bs.modal', () => {
            window.location.href = 'solicitudes.html';
        });
    }
});
