const hostApi = ["", "localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "localhost"
  : window.location.hostname;

const API_BASE_URL = `http://${hostApi}:8080/api/v1`;
const CLAVE_CORREO_DOCENTE = "visitasITR.correoDocente";
const MARCADOR_SOLICITUD_PADRE = "[SOLICITUD_PADRE]";

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
      contenido?.message ||
      contenido?.detail ||
      contenido?.error ||
      `La API respondió con el estado ${respuesta.status}.`
    );
  }

  return contenido && Object.prototype.hasOwnProperty.call(contenido, "data")
    ? contenido.data
    : contenido;
}

function separarFechaHora(fechaReunion) {
  const [fecha = "", horaCompleta = ""] = (fechaReunion || "").split("T");
  return { fecha, hora: horaCompleta.slice(0, 5) };
}

export async function obtenerSolicitudesDocente() {
  const correo = localStorage.getItem(CLAVE_CORREO_DOCENTE)?.trim().toLowerCase();

  if (!correo) {
    throw new Error("Inicie sesión como docente para consultar las solicitudes.");
  }

  const empleados = await solicitarApi("/empleados");
  const empleado = (Array.isArray(empleados) ? empleados : []).find(
    registro => registro.empCorreo?.trim().toLowerCase() === correo
  );

  if (!empleado) {
    throw new Error("El correo de la sesión no pertenece a un docente registrado.");
  }

  const citas = await solicitarApi(
    `/citas-reuniones/por-empleado/${encodeURIComponent(empleado.idEmpleado)}`
  );

  return (Array.isArray(citas) ? citas : [])
    .filter(cita =>
      cita.estado === "PENDIENTE" &&
      cita.observaciones?.startsWith(MARCADOR_SOLICITUD_PADRE)
    )
    .map(cita => {
      const fechaHora = separarFechaHora(cita.fechaReunion);

      return {
        idCita: Number(cita.idCita),
        nombreEncargado: cita.nombreEncargado || "Encargado no disponible",
        nombreEstudiante: cita.nombreEstudiante || "Estudiante no disponible",
        motivo: cita.motivo || "Sin motivo",
        descripcion: cita.observaciones
          .slice(MARCADOR_SOLICITUD_PADRE.length)
          .trim() || cita.motivo,
        fecha: fechaHora.fecha,
        hora: fechaHora.hora,
        fechaReunion: cita.fechaReunion
      };
    })
    .sort((primera, segunda) =>
      (primera.fechaReunion || "").localeCompare(segunda.fechaReunion || "")
    );
}
