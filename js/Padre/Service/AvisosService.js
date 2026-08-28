const hostApi = ["", "localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "localhost"
  : window.location.hostname;

const API_BASE_URL = `http://${hostApi}:8080/api/v1`;

async function solicitarApi(ruta) {
  let respuesta;

  try {
    respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
      headers: { Accept: "application/json" }
    });
  } catch (error) {
    throw new Error(
      "No se pudo conectar con la API. Compruebe que esté ejecutándose en el puerto 8080."
    );
  }

  const tipoContenido = respuesta.headers.get("content-type") || "";
  const contenido = tipoContenido.includes("json")
    ? await respuesta.json()
    : null;

  if (!respuesta.ok) {
    throw new Error(
      contenido?.message || contenido?.detail || "No fue posible obtener los avisos."
    );
  }

  return contenido && Object.prototype.hasOwnProperty.call(contenido, "data")
    ? contenido.data
    : contenido;
}

/**
 * Avisos visibles, del más reciente al más antiguo.
 *
 * El endpoint /comunicados devuelve solo los activos, así que los
 * retirados por el docente no llegan aquí.
 *
 * @param {number} limite cuántos avisos devolver como máximo.
 */
export async function obtenerAvisos(limite = 3) {
  const comunicados = await solicitarApi("/comunicados");

  return (Array.isArray(comunicados) ? comunicados : [])
    .slice(0, limite)
    .map(comunicado => ({
      idComunicado: comunicado.idComunicado,
      mensaje: comunicado.comMensaje,
      docente: comunicado.nombreDocente || "Docente",
      fecha: comunicado.comFecha,
      fechaTexto: formatearFecha(comunicado.comFecha)
    }));
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("es-SV", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(fecha));
  } catch (error) {
    return "";
  }
}