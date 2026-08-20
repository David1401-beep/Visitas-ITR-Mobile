const hostApi = ["", "localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "localhost"
  : window.location.hostname;

const API_BASE_URL = `http://${hostApi}:8080/api/v1`;
const CLAVE_CORREO_SESION = "visitasITR.correoPadre";

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
  const contenido = tipoContenido.includes("application/json")
    ? await respuesta.json()
    : null;

  if (!respuesta.ok) {
    throw new Error(
      contenido?.message || contenido?.error || `La API respondió con el estado ${respuesta.status}.`
    );
  }

  if (contenido && Object.prototype.hasOwnProperty.call(contenido, "data")) {
    return contenido.data;
  }

  return contenido;
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
    RECHAZADA: "rechazada",
    CANCELADA: "cancelada",
    FINALIZADA: "finalizada"
  };

  return estados[estado] || estado?.toLowerCase() || "pendiente";
}

export async function obtenerConvocatoriasPadre() {
  const correoSesion = localStorage.getItem(CLAVE_CORREO_SESION)?.trim().toLowerCase();

  if (!correoSesion) {
    throw new Error("Inicie sesión para consultar las convocatorias.");
  }

  const [usuarios, estudiantes, relaciones, citas] = await Promise.all([
    solicitarApi("/usuarios"),
    solicitarApi("/estudiantes"),
    solicitarApi("/estudiante-encargados"),
    solicitarApi("/citas-reuniones")
  ]);

  const usuarioSesion = usuarios.find(
    usuario => usuario.usuEmail?.trim().toLowerCase() === correoSesion
  );

  if (!usuarioSesion) {
    throw new Error("El correo de la sesión no está registrado en la API.");
  }

  const estudiantesSesion = estudiantes.filter(
    estudiante => Number(estudiante.usuarioEstudiante) === Number(usuarioSesion.idUsuario)
  );

  if (estudiantesSesion.length === 0) {
    throw new Error("El usuario de la sesión no tiene estudiantes asociados.");
  }

  const idsEstudiantes = new Set(
    estudiantesSesion.map(estudiante => Number(estudiante.idEstudiante))
  );
  const relacionesSesion = relaciones.filter(
    relacion => idsEstudiantes.has(Number(relacion.idEstudiante))
  );
  const idsRelaciones = new Set(
    relacionesSesion.map(relacion => Number(relacion.idEstudianteEncargado))
  );

  return citas
    .filter(cita => idsRelaciones.has(Number(cita.idEstudianteEncargado)))
    .map(cita => {
      const relacion = relacionesSesion.find(
        item => Number(item.idEstudianteEncargado) === Number(cita.idEstudianteEncargado)
      );
      const estudiante = estudiantesSesion.find(
        item => Number(item.idEstudiante) === Number(relacion?.idEstudiante)
      );
      const fechaHora = separarFechaHora(cita.fechaReunion);
      const nombreEstudiante = relacion?.nombreEstudiante ||
        `${estudiante?.estNombre || ""} ${estudiante?.estApellido || ""}`.trim() ||
        "Estudiante no disponible";

      return {
        idCita: cita.idCita,
        idEstudiante: relacion?.idEstudiante,
        idEstudianteEncargado: cita.idEstudianteEncargado,
        asunto: cita.motivo,
        descripcion: cita.observaciones || "Sin descripción.",
        fecha: fechaHora.fecha,
        hora: fechaHora.hora,
        fechaReunion: cita.fechaReunion,
        estudianteNombre: nombreEstudiante,
        estado: normalizarEstado(cita.estado)
      };
    })
    .sort((primera, segunda) =>
      (primera.fechaReunion || "").localeCompare(segunda.fechaReunion || "")
    );
}
