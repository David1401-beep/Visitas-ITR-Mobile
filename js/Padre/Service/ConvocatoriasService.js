const hostApi = ["", "localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "localhost"
  : window.location.hostname;

const API_BASE_URL = `http://${hostApi}:8080/api/v1`;
const CLAVE_CORREO_SESION = "visitasITR.correoPadre";
const CLAVE_DATOS_SESION = "visitasITR.sesionPadre";

async function solicitarApi(ruta, opciones = {}) {
  const configuracion = {
    ...opciones,
    headers: {
      Accept: "application/json",
      ...(opciones.body ? { "Content-Type": "application/json" } : {}),
      ...opciones.headers
    }
  };

  let respuesta;

  try {
    respuesta = await fetch(`${API_BASE_URL}${ruta}`, configuracion);
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
      contenido?.message ||
      contenido?.detail ||
      contenido?.error ||
      `La API respondió con el estado ${respuesta.status}.`
    );
  }

  if (contenido && Object.prototype.hasOwnProperty.call(contenido, "data")) {
    return contenido.data;
  }

  return contenido;
}

function obtenerSesionPadre() {
  const correoSesion = localStorage.getItem(CLAVE_CORREO_SESION)?.trim().toLowerCase();
  let sesion;

  if (!correoSesion) {
    throw new Error("Inicie sesión para consultar las convocatorias.");
  }

  try {
    sesion = JSON.parse(localStorage.getItem(CLAVE_DATOS_SESION) || "null");
  } catch (error) {
    sesion = null;
  }

  if (!sesion || sesion.correoEstudiante?.trim().toLowerCase() !== correoSesion) {
    throw new Error("La sesión no es válida. Vuelva a iniciar sesión.");
  }

  const idsEstudianteEncargado = (sesion.idsEstudianteEncargado || [])
    .map(id => Number(id))
    .filter(id => Number.isInteger(id) && id > 0);

  if (idsEstudianteEncargado.length === 0) {
    throw new Error("El estudiante no tiene un encargado asociado.");
  }

  return {
    ...sesion,
    idsEstudianteEncargado: [...new Set(idsEstudianteEncargado)]
  };
}

function separarFechaHora(fechaReunion) {
  if (!fechaReunion) return { fecha: "", hora: "" };

  const [fecha = "", horaCompleta = ""] = fechaReunion.split("T");
  return {
    fecha,
    hora: horaCompleta.slice(0, 5)
  };
}

function normalizarEstado(estado) {
  const estados = {
    PENDIENTE: "pendiente",
    ACEPTADA: "aceptada",
    POSPUESTA: "pospuesta",
    RECHAZADA: "rechazada",
    CANCELADA: "cancelada",
    FINALIZADA: "finalizada"
  };

  return estados[estado] || estado?.toLowerCase() || "pendiente";
}

function convertirConvocatoria(cita) {
  const fechaHora = separarFechaHora(cita.fechaReunion);

  return {
    idCita: Number(cita.idCita),
    idEstudiante: Number(cita.idEstudiante),
    idEstudianteEncargado: Number(cita.idEstudianteEncargado),
    asunto: cita.motivo,
    descripcion: cita.observaciones || "Sin descripción.",
    fecha: fechaHora.fecha,
    hora: fechaHora.hora,
    fechaReunion: cita.fechaReunion,
    estudianteNombre: cita.nombreEstudiante || "Estudiante no disponible",
    estado: normalizarEstado(cita.estado)
  };
}

export async function obtenerConvocatoriasPadre() {
  const sesion = obtenerSesionPadre();
  const parametros = new URLSearchParams();

  sesion.idsEstudianteEncargado.forEach(id => parametros.append("ids", String(id)));

  const citas = await solicitarApi(
    `/citas-reuniones/por-estudiante-encargado?${parametros.toString()}`
  );

  return (Array.isArray(citas) ? citas : [])
    .map(convertirConvocatoria)
    .sort((primera, segunda) =>
      (primera.fechaReunion || "").localeCompare(segunda.fechaReunion || "")
    );
}

export async function aceptarConvocatoria(idCita, idEstudianteEncargado) {
  const citaActualizada = await solicitarApi(
    `/citas-reuniones/${encodeURIComponent(idCita)}/respuesta-encargado`,
    {
      method: "PATCH",
      body: JSON.stringify({
        idEstudianteEncargado: Number(idEstudianteEncargado),
        estado: "ACEPTADA"
      })
    }
  );

  return convertirConvocatoria(citaActualizada);
}

export async function posponerConvocatoria(
  idCita,
  idEstudianteEncargado,
  nuevaFecha,
  nuevaHora,
  motivoReprogramacion
) {
  const citaActualizada = await solicitarApi(
    `/citas-reuniones/${encodeURIComponent(idCita)}/respuesta-encargado`,
    {
      method: "PATCH",
      body: JSON.stringify({
        idEstudianteEncargado: Number(idEstudianteEncargado),
        estado: "POSPUESTA",
        nuevaFechaReunion: `${nuevaFecha}T${nuevaHora}:00`,
        motivoReprogramacion: motivoReprogramacion.trim()
      })
    }
  );

  return convertirConvocatoria(citaActualizada);
}
