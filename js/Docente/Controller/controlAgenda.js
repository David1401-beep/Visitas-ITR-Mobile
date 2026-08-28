import { obtenerResumenAgenda } from "../Service/agendaService.js";

const resumenAgenda = document.getElementById("resumen-agenda");

const CONTADORES = [
  { clave: "hoy", etiqueta: "Hoy" },
  { clave: "semana", etiqueta: "Esta semana" },
  { clave: "solicitudes", etiqueta: "Solicitudes" }
];

document.addEventListener("DOMContentLoaded", cargarResumen);

document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    cargarResumen();
  }
});

async function cargarResumen() {
  if (!resumenAgenda) {
    return;
  }

  try {
    const resumen = await obtenerResumenAgenda();

    resumenAgenda.innerHTML = CONTADORES
      .map(contador => construirContador(contador, resumen[contador.clave]))
      .join("");
  } catch (error) {
    console.error("No fue posible cargar el resumen de la agenda.", error);

    resumenAgenda.innerHTML =
      '<p class="agenda-resumen-error">No fue posible cargar su agenda.</p>';
  }
}

function construirContador(contador, cantidad) {
  const valor = Number(cantidad) || 0;
  const claseNumero = valor > 0
    ? "agenda-contador-numero"
    : "agenda-contador-numero vacio";

  return `
    <div class="agenda-contador" id="contador-${contador.clave}">
      <span class="${claseNumero}">${valor}</span>
      <span class="agenda-contador-etiqueta">${escaparHtml(contador.etiqueta)}</span>
    </div>
  `;
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}