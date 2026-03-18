// ==============================
// ORGANIZADOR SEMANAL - APP.JS
// ==============================

// ----- Estado principal -----
let actividades = [];
let actividadEditandoId = null;

// ----- Referencias del DOM -----
const taskModal = document.getElementById("taskModal");
const openTaskModalBtn = document.getElementById("openTaskModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const taskForm = document.getElementById("taskForm");
const deleteTaskBtn = document.getElementById("deleteTaskBtn");

const taskIdInput = document.getElementById("taskId");
const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionInput = document.getElementById("taskDescription");
const taskDayInput = document.getElementById("taskDay");
const taskHourInput = document.getElementById("taskHour");
const taskColorInput = document.getElementById("taskColor");

const modalTitle = document.getElementById("modalTitle");
const currentWeekLabel = document.getElementById("currentWeekLabel");
const prevWeekBtn = document.getElementById("prevWeekBtn");
const nextWeekBtn = document.getElementById("nextWeekBtn");

const timeSlots = document.querySelectorAll(".time-slot");

// ----- Semana actual (base simple) -----
let desplazamientoSemana = 0;

// ==============================
// INICIALIZACIÓN
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  cargarActividades();
  actualizarEtiquetaSemana();
  renderActividades();
  asignarEventosIniciales();
});

// ==============================
// EVENTOS INICIALES
// ==============================
function asignarEventosIniciales() {
  if (openTaskModalBtn) {
    openTaskModalBtn.addEventListener("click", abrirModalNuevaActividad);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", cerrarModal);
  }

  if (taskForm) {
    taskForm.addEventListener("submit", guardarActividad);
  }

  if (deleteTaskBtn) {
    deleteTaskBtn.addEventListener("click", eliminarActividadActual);
  }

  if (prevWeekBtn) {
    prevWeekBtn.addEventListener("click", () => {
      desplazamientoSemana--;
      actualizarEtiquetaSemana();
    });
  }

  if (nextWeekBtn) {
    nextWeekBtn.addEventListener("click", () => {
      desplazamientoSemana++;
      actualizarEtiquetaSemana();
    });
  }

  // Click en cada celda de la grilla
  timeSlots.forEach((slot) => {
    slot.addEventListener("click", () => {
      const day = slot.dataset.day;
      const hour = slot.dataset.hour;

      abrirModalNuevaActividad(day, hour);
    });
  });

  // Cerrar modal al hacer click fuera del contenido
  if (taskModal) {
    taskModal.addEventListener("click", (event) => {
      if (event.target === taskModal) {
        cerrarModal();
      }
    });
  }
}

// ==============================
// MODAL
// ==============================
function abrirModalNuevaActividad(day = "", hour = "") {
  actividadEditandoId = null;
  limpiarFormulario();

  modalTitle.textContent = "Agregar actividad";
  deleteTaskBtn.style.display = "none";

  if (day) taskDayInput.value = day;
  if (hour) taskHourInput.value = hour;

  taskModal.classList.remove("hidden");
}

function abrirModalEditarActividad(actividad) {
  actividadEditandoId = actividad.id;

  modalTitle.textContent = "Editar actividad";
  deleteTaskBtn.style.display = "inline-block";

  taskIdInput.value = actividad.id;
  taskTitleInput.value = actividad.titulo;
  taskDescriptionInput.value = actividad.descripcion;
  taskDayInput.value = actividad.dia;
  taskHourInput.value = actividad.hora;
  taskColorInput.value = actividad.color;

  taskModal.classList.remove("hidden");
}

function cerrarModal() {
  taskModal.classList.add("hidden");
  limpiarFormulario();
  actividadEditandoId = null;
}

function limpiarFormulario() {
  taskForm.reset();
  taskIdInput.value = "";
  taskColorInput.value = "#8b5cf6";
}

// ==============================
// CRUD DE ACTIVIDADES
// ==============================
function guardarActividad(event) {
  event.preventDefault();

  const titulo = taskTitleInput.value.trim();
  const descripcion = taskDescriptionInput.value.trim();
  const dia = taskDayInput.value;
  const hora = taskHourInput.value;
  const color = taskColorInput.value;

  if (!titulo || !dia || !hora) {
    alert("Completá actividad, día y hora.");
    return;
  }

  // Validar si ya existe una actividad en ese mismo día y hora
  const existeConflicto = actividades.some((actividad) => {
    const mismaCelda = actividad.dia === dia && actividad.hora === hora;
    const noEsLaMisma = actividad.id !== actividadEditandoId;
    return mismaCelda && noEsLaMisma;
  });

  if (existeConflicto) {
    alert("Ya existe una actividad asignada a ese día y horario.");
    return;
  }

  if (actividadEditandoId) {
    actividades = actividades.map((actividad) =>
      actividad.id === actividadEditandoId
        ? {
            ...actividad,
            titulo,
            descripcion,
            dia,
            hora,
            color,
          }
        : actividad
    );
  } else {
    const nuevaActividad = {
      id: generarIdUnico(),
      titulo,
      descripcion,
      dia,
      hora,
      color,
    };

    actividades.push(nuevaActividad);
  }

  guardarActividades();
  renderActividades();
  cerrarModal();
}

function eliminarActividadActual() {
  if (!actividadEditandoId) return;

  const confirmar = window.confirm("¿Querés eliminar esta actividad?");
  if (!confirmar) return;

  actividades = actividades.filter(
    (actividad) => actividad.id !== actividadEditandoId
  );

  guardarActividades();
  renderActividades();
  cerrarModal();
}

// ==============================
// RENDER
// ==============================
function renderActividades() {
  limpiarGrillaVisual();

  actividades.forEach((actividad) => {
    const selector = `.time-slot[data-day="${actividad.dia}"][data-hour="${actividad.hora}"]`;
    const slot = document.querySelector(selector);

    if (!slot) return;

    const taskElement = document.createElement("div");
    taskElement.classList.add("task");
    taskElement.style.backgroundColor = actividad.color;
    taskElement.style.color = obtenerColorTexto(actividad.color);

    taskElement.innerHTML = `
      <strong>${escapeHTML(actividad.titulo)}</strong>
      ${
        actividad.descripcion
          ? `<div style="margin-top: 4px; font-size: 11px;">${escapeHTML(
              actividad.descripcion
            )}</div>`
          : ""
      }
    `;

    taskElement.addEventListener("click", (event) => {
      event.stopPropagation();
      abrirModalEditarActividad(actividad);
    });

    slot.appendChild(taskElement);
  });
}

function limpiarGrillaVisual() {
  const tareasRenderizadas = document.querySelectorAll(".time-slot .task");
  tareasRenderizadas.forEach((tarea) => tarea.remove());
}

// ==============================
// LOCAL STORAGE
// ==============================
function guardarActividades() {
  localStorage.setItem("actividades-semanales", JSON.stringify(actividades));
}

function cargarActividades() {
  const data = localStorage.getItem("actividades-semanales");

  if (!data) {
    actividades = [];
    return;
  }

  try {
    actividades = JSON.parse(data);
  } catch (error) {
    console.error("Error al leer actividades desde localStorage:", error);
    actividades = [];
  }
}

// ==============================
// SEMANA ACTUAL
// ==============================
function actualizarEtiquetaSemana() {
  if (!currentWeekLabel) return;

  const hoy = new Date();
  const fechaBase = new Date(hoy);
  fechaBase.setDate(hoy.getDate() + desplazamientoSemana * 7);

  const lunes = obtenerLunesDeLaSemana(fechaBase);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  currentWeekLabel.textContent = `Semana ${formatearFecha(lunes)} - ${formatearFecha(domingo)}`;
}

function obtenerLunesDeLaSemana(fecha) {
  const nuevaFecha = new Date(fecha);
  const dia = nuevaFecha.getDay(); // 0 domingo, 1 lunes, ...
  const diferencia = dia === 0 ? -6 : 1 - dia;
  nuevaFecha.setDate(nuevaFecha.getDate() + diferencia);
  nuevaFecha.setHours(0, 0, 0, 0);
  return nuevaFecha;
}

function formatearFecha(fecha) {
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });
}

// ==============================
// HELPERS
// ==============================
function generarIdUnico() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function obtenerColorTexto(colorHex) {
  const hex = colorHex.replace("#", "");

  if (hex.length !== 6) return "#000000";

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // luminancia aproximada
  const luminancia = (r * 299 + g * 587 + b * 114) / 1000;

  return luminancia > 150 ? "#000000" : "#FFFFFF";
}

function escapeHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}