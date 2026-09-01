import { haySesionActiva, esDocente, limpiarSesion } from "./sesionService.js";

const LOGIN = "../inicioSesion.html";

if (!haySesionActiva()) {
    window.location.replace(LOGIN);
} else {
    const enDocentes = window.location.pathname.includes("/Docentes/");
    const enPadres = window.location.pathname.includes("/Padres/");

    const rolCorrecto = enDocentes ? esDocente() : enPadres ? !esDocente() : true;

    if (!rolCorrecto) {
        limpiarSesion();
        window.location.replace(LOGIN);
    }
}