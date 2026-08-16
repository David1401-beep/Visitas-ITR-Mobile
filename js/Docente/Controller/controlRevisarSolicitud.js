// Crea un modal compatible: usa Bootstrap cuando está disponible y una alternativa local si el CDN falla.
function createCompatibleModal(modalElement) {
    if (window.bootstrap?.Modal) {
        return window.bootstrap.Modal.getOrCreateInstance(modalElement);
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
    if (btnAceptar && acceptModalEl) {
        const acceptModal = createCompatibleModal(acceptModalEl);
        btnAceptar.addEventListener('click', (e) => {
            e.preventDefault();
            acceptModal.show();
        });

        acceptModalEl.addEventListener('hidden.bs.modal', () => {
            window.location.href = 'verSolicitud.html';
        });
    }

    // Modal de Rechazar
    const btnRechazar = document.getElementById('btn-rechazar-solicitud');
    const rejectModalEl = document.getElementById('rejectSuccessModal');
    if (btnRechazar && rejectModalEl) {
        const rejectModal = createCompatibleModal(rejectModalEl);
        btnRechazar.addEventListener('click', (e) => {
            e.preventDefault();
            rejectModal.show();
        });

        rejectModalEl.addEventListener('hidden.bs.modal', () => {
            window.location.href = 'verSolicitud.html';
        });
    }
});
