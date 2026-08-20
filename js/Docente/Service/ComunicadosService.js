const CLAVE_COMUNICADOS = "visitasITR.comunicadosLocales";
const CLAVE_CORREO_DOCENTE = "visitasITR.correoDocente";

function leerComunicadosLocales() {
  try {
    const comunicados = JSON.parse(localStorage.getItem(CLAVE_COMUNICADOS) || "[]");
    return Array.isArray(comunicados) ? comunicados : [];
  } catch (error) {
    return [];
  }
}

function obtenerNombreDocente() {
  const correo = localStorage.getItem(CLAVE_CORREO_DOCENTE)?.trim();

  if (!correo) {
    return "Docente";
  }

  return correo
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, letra => letra.toUpperCase());
}

export function obtenerComunicados() {
  return leerComunicadosLocales().sort(
    (primero, segundo) => new Date(segundo.fechaPublicacion) - new Date(primero.fechaPublicacion)
  );
}

export function publicarComunicado(mensaje) {
  const comunicados = leerComunicadosLocales();
  const comunicado = {
    idComunicado: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    mensaje: mensaje.trim(),
    nombreEmpleado: obtenerNombreDocente(),
    fechaPublicacion: new Date().toISOString()
  };

  comunicados.unshift(comunicado);
  localStorage.setItem(CLAVE_COMUNICADOS, JSON.stringify(comunicados));
  return comunicado;
}
