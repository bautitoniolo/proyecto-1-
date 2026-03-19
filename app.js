let tareas = [];

const slots = document.querySelectorAll(".slot");

// cargar tareas guardadas
const data = localStorage.getItem("tareas");
if (data) {
  tareas = JSON.parse(data);
  render();
}

// click en celda
slots.forEach(slot => {
  slot.addEventListener("click", () => {
    const texto = prompt("¿Qué querés hacer?");
    if (!texto) return;

    const dia = slot.dataset.day;
    const hora = slot.dataset.hour;

    tareas.push({ dia, hora, texto });

    guardar();
    render();
  });
});

// renderizar tareas
function render() {
  document.querySelectorAll(".task").forEach(t => t.remove());

  tareas.forEach(t => {
    const slot = document.querySelector(
      `.slot[data-day="${t.dia}"][data-hour="${t.hora}"]`
    );

    if (!slot) return;

    const div = document.createElement("div");
    div.className = "task";
    div.textContent = t.texto;

    div.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("¿Eliminar tarea?")) {
        tareas = tareas.filter(x => x !== t);
        guardar();
        render();
      }
    });

    slot.appendChild(div);
  });
}

// guardar
function guardar() {
  localStorage.setItem("tareas", JSON.stringify(tareas));
}