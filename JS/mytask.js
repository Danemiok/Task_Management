/* ---------- STORAGE HELPERS ---------- */
function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* ---------- PAGE SWITCH ---------- */
function showAddTaskPage() {
  document.getElementById("add-task-page").classList.add("active");
  document.getElementById("my-tasks-page").classList.remove("active");
}

function showMyTasksPage() {
  document.getElementById("add-task-page").classList.remove("active");
  document.getElementById("my-tasks-page").classList.add("active");
  renderTasks();
}

/* ---------- ADD TASK ---------- */
function addTask() {
  const title = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-description").value.trim();
  const category = document.getElementById("task-category").value;
  const priority = document.getElementById("task-priority").value;
  const dueDate = document.getElementById("task-due-date").value;

  if (!title) {
    alert("Task title is required!");
    return;
  }

  const tasks = getTasks();

  tasks.push({
    title,
    description,
    category,
    priority,
    dueDate,
    status: "Pending"
  });

  saveTasks(tasks);
  document.getElementById("task-form").reset();
  showMyTasksPage();
}

/* ---------- RENDER TASKS ---------- */
function renderTasks() {
  const tbody = document.getElementById("tasks-table-body");
  tbody.innerHTML = "";

  const tasks = getTasks();

  tasks.forEach((task, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${task.title}</td>
      <td>${task.status}</td>
      <td>${task.category}</td>
      <td>${task.priority}</td>
      <td>${task.dueDate || "-"}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteTask(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/* ---------- DELETE ---------- */
function deleteTask(index) {
  if (!confirm("Delete this task?")) return;
  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks();
}

/* ---------- LOAD ---------- */
document.addEventListener("DOMContentLoaded", renderTasks);