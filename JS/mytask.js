/* =========================
   STORAGE HELPERS
========================= */
function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* =========================
   PAGE SWITCHING
========================= */
function hideAllPages() {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
    page.style.display = "none";
  });
}

function showAddTaskPage() {
  hideAllPages();
  document.getElementById("add-task-page").style.display = "block";
  document.getElementById("add-task-page").classList.add("active");
}

function showMyTasksPage() {
  hideAllPages();
  document.getElementById("my-tasks-page").style.display = "block";
  document.getElementById("my-tasks-page").classList.add("active");
  renderTasks();
}

function showCategoriesPage() {
  hideAllPages();
  document.getElementById("categories-page").style.display = "block";
  document.getElementById("categories-page").classList.add("active");
  renderCategories();
}

/* =========================
   ADD TASK
========================= */
function addTask(event) {
  event.preventDefault(); // prevent form submission

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
    status: "Pending",
    createdAt: new Date().toISOString()
  });

  saveTasks(tasks);
  document.getElementById("task-form").reset();

  renderTasks();
  renderCategories();
  showMyTasksPage();
}

/* =========================
   RENDER TASKS
========================= */
function renderTasks() {
  const tbody = document.getElementById("tasks-table-body");
  if (!tbody) return;

  const tasks = getTasks();
  tbody.innerHTML = "";

  if (tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No tasks found</td></tr>`;
    return;
  }

  tasks.forEach((task, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${task.title}</td>
      <td>${task.status}</td>
      <td>${task.category}</td>
      <td>${task.priority}</td>
      <td>${task.dueDate || "-"}</td>
      <td>
        <button class="btn btn-sm btn-success" onclick="toggleStatus(${index})">✔</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTask(${index})">🗑</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

/* =========================
   DELETE TASK
========================= */
function deleteTask(index) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);

  renderTasks();
  renderCategories();
}

/* =========================
   TOGGLE STATUS
========================= */
function toggleStatus(index) {
  const tasks = getTasks();
  tasks[index].status = tasks[index].status === "Pending" ? "Completed" : "Pending";
  saveTasks(tasks);
  renderTasks();
}

/* =========================
   CATEGORIES PAGE
========================= */
function renderCategories() {
  const container = document.getElementById("categories-container");
  if (!container) return;

  container.innerHTML = "";

  // Define all possible categories with a color
  const allCategories = [
    { name: "Work", color: "#f39c12" },
    { name: "Personal", color: "#3498db" },
    { name: "Study", color: "#9b59b6" },
    { name: "Health", color: "#1abc9c" },
    { name: "Finance", color: "#e74c3c" },
    { name: "Other", color: "#95a5a6" }
  ];

  const tasks = getTasks();

  allCategories.forEach(cat => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-3";

    // Get tasks in this category
    const catTasks = tasks.filter(task => task.category === cat.name);

    // Generate list items with different colors based on priority
    const taskList = catTasks.map(task => {
      let taskColor;
      if (task.priority === "High") taskColor = "#e74c3c"; // red
      else if (task.priority === "Medium") taskColor = "#f1c40f"; // yellow
      else taskColor = "#2ecc71"; // green
      return `<li style="color:${taskColor}">${task.title} (${task.status})</li>`;
    }).join("");

    col.innerHTML = `
      <div class="card shadow-sm" style="border-top: 5px solid ${cat.color}">
        <div class="card-body">
          <h5 class="card-title">${cat.name}</h5>
          <p class="card-text">
            <strong>${catTasks.length}</strong> task(s)
          </p>
          ${catTasks.length > 0 ? `<ul>${taskList}</ul>` : `<p class="text-muted">No tasks</p>`}
        </div>
      </div>
    `;

    container.appendChild(col);
  });
}


/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  // Default page
  showAddTaskPage();
  renderTasks();
  renderCategories();

  // Sidebar navigation
  document.querySelectorAll('#sidebar .nav-link').forEach(link => {
    link.addEventListener('click', function () {
      const page = this.getAttribute('data-page');
      if (page === 'add-task') showAddTaskPage();
      else if (page === 'my-tasks') showMyTasksPage();
      else if (page === 'categories') showCategoriesPage();
    });
  });

  // Attach add task form submit
  const taskForm = document.getElementById("task-form");
  taskForm.addEventListener("submit", addTask);
});
