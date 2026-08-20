const hostApi = ["", "localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "localhost"
  : window.location.hostname;

const API_BASE_URL = `http://${hostApi}:8080/api/v1`;
const CLAVE_CORREO_DOCENTE = "visitasITR.correoDocente";

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

  return contenido && Object.prototype.hasOwnProperty.call(contenido, "data")
    ? contenido.data
    : contenido;
}

// Busca en la API al docente de la sesión mobile y carga los estudiantes disponibles.
export async function obtenerDatosFormularioCita() {
  const correo = localStorage.getItem(CLAVE_CORREO_DOCENTE)?.trim().toLowerCase();

  if (!correo) {
    throw new Error("Inicie sesión como docente para registrar una cita.");
  }

  const [empleados, relaciones] = await Promise.all([
    solicitarApi("/empleados"),
    solicitarApi("/estudiante-encargados")
  ]);

  const empleado = (Array.isArray(empleados) ? empleados : []).find(
    registro => registro.empCorreo?.trim().toLowerCase() === correo
  );

  if (!empleado) {
    throw new Error("El correo de la sesión no pertenece a un docente registrado.");
  }

  return {
    idEmpleado: Number(empleado.idEmpleado),
    relaciones: Array.isArray(relaciones) ? relaciones : []
  };
}

// Guarda una cita creada desde mobile usando el mismo contrato que el formulario web.
export async function crearCitaDocente(datosCita, idEmpleado) {
  return solicitarApi("/citas-reuniones", {
    method: "POST",
    body: JSON.stringify({
      idEmpleado: Number(idEmpleado),
      idEstudianteEncargado: Number(datosCita.idEstudianteEncargado),
      motivo: datosCita.asunto,
      estado: "PENDIENTE",
      observaciones: datosCita.descripcion,
      fechaReunion: `${datosCita.fecha}T${datosCita.hora}:00`
    })
  });
}
