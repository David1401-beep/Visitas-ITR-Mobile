const CLAVE_COMUNICADOS = "visitasITR.comunicadosLocales";

export function obtenerComunicados() {
  try {
    const comunicados = JSON.parse(localStorage.getItem(CLAVE_COMUNICADOS) || "[]");

    if (!Array.isArray(comunicados)) {
      return [];
    }

    return comunicados.sort(
      (primero, segundo) => new Date(segundo.fechaPublicacion) - new Date(primero.fechaPublicacion)
    );
  } catch (error) {
    return [];
  }
}
