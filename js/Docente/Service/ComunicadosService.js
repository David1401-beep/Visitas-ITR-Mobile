import { solicitarApi, obtenerDocenteActivo } from "./CrearCitaService.js";


const LIMITE_MENSAJE = 500;

export async function obtenerComunicados() {
  const docente = await obtenerDocenteActivo();

  const comunicados = await solicitarApi(
    `/comunicados/por-docente/${docente.idDocente}`
  );

  return (Array.isArray(comunicados) ? comunicados : []).map(convertirComunicado);
}

export async function publicarComunicado(mensaje) {
  const texto = String(mensaje || "").trim();

  if (!texto) {
    throw new Error("Escriba un comunicado antes de enviarlo.");
  }

  const docente = await obtenerDocenteActivo();

  const comunicado = await solicitarApi("/comunicados", {
    method: "POST",
    body: JSON.stringify({
      idDocente: Number(docente.idDocente),
      comMensaje: texto.slice(0, LIMITE_MENSAJE)
    })
  });

  return convertirComunicado(comunicado);
}

export async function actualizarComunicado(idComunicado, mensaje) {
  const texto = String(mensaje || "").trim();

  if (!texto) {
    throw new Error("El comunicado no puede quedar vacío.");
  }

  const docente = await obtenerDocenteActivo();

  const comunicado = await solicitarApi(`/comunicados/${idComunicado}`, {
    method: "PUT",
    body: JSON.stringify({
      idDocente: Number(docente.idDocente),
      comMensaje: texto.slice(0, LIMITE_MENSAJE)
    })
  });

  return convertirComunicado(comunicado);
}

export async function retirarComunicado(idComunicado) {
  const comunicado = await solicitarApi(`/comunicados/${idComunicado}/retirar`, {
    method: "PATCH"
  });

  return convertirComunicado(comunicado);
}

export async function eliminarComunicado(idComunicado) {
  await solicitarApi(`/comunicados/${idComunicado}`, { method: "DELETE" });
  return true;
}

function convertirComunicado(comunicado) {
  return {
    idComunicado: comunicado.idComunicado,
    idDocente: comunicado.idDocente,
    mensaje: comunicado.comMensaje,
    nombreEmpleado: comunicado.nombreDocente || "Docente",
    fechaPublicacion: comunicado.comFecha,
    activo: comunicado.comActivo === "S"
  };
}