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
      contenido?.message || contenido?.detail || "No fue posible completar la solicitud."
    );
  }

  return contenido && Object.prototype.hasOwnProperty.call(contenido, "data")
    ? contenido.data
    : contenido;
}

export async function iniciarSesionPadre(correoEstudiante, password) {
  const correo = String(correoEstudiante || "").trim().toLowerCase();

  if (!correo) {
    throw new Error("Debe ingresar el correo del estudiante.");
  }

  if (!password) {
    throw new Error("Debe ingresar su contraseña.");
  }

  const estudiantes = await solicitarApi("/estudiantes");
  const lista = Array.isArray(estudiantes) ? estudiantes : [];

  const estudiante = lista.find(
    registro => registro.estCorreo?.trim().toLowerCase() === correo
  );

  if (!estudiante) {
    throw new Error("No se encontró un estudiante con ese correo.");
  }

  const relaciones = await solicitarApi("/estudiante-encargados");

  const relacionesDelEstudiante = (Array.isArray(relaciones) ? relaciones : [])
    .filter(relacion => Number(relacion.idEstudiante) === Number(estudiante.idEstudiante));

  if (relacionesDelEstudiante.length === 0) {
    throw new Error("El estudiante todavía no tiene un encargado asociado.");
  }

  return {
    correoEstudiante: estudiante.estCorreo,
    nombreEstudiante: `${estudiante.estNombre || ""} ${estudiante.estApellido || ""}`.trim(),
    codigoEstudiante: estudiante.estCodigo || "",

    idsEstudiante: [Number(estudiante.idEstudiante)],

    nombreEncargado: relacionesDelEstudiante[0].nombreEncargado || "Encargado",
    idEncargado: Number(relacionesDelEstudiante[0].idEncargado),

    idsEstudianteEncargado: relacionesDelEstudiante.map(
      relacion => Number(relacion.idEstudianteEncargado)
    )
  };
}

/**
 * Cierra la sesión del encargado.
 */
export function cerrarSesionPadre() {
  localStorage.removeItem("visitasITR.sesionPadre");
  localStorage.removeItem("visitasITR.correoEstudiante");
}