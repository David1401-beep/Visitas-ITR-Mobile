// Controla la lectura de parámetros URL, actualización de datos y el modal de aceptación para Docentes.
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

    const modalNombre = document.getElementById('modal-solicitante-nombre');
    const modalTexto = document.getElementById('modal-solicitante-texto');
    if (modalNombre) modalNombre.textContent = nombre;
    if (modalTexto) modalTexto.textContent = nombre;

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
});
