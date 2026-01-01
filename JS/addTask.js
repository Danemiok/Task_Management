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
   CATEGORY COLORS
========================= */
const categoryStyles = {
    Work: "bg-primary",
    Personal: "bg-success",
    Study: "bg-info",
    Health: "bg-danger",
    Finance: "bg-warning",
    Other: "bg-secondary"
};

/* =========================
   PAGE SWITCHING
========================= */
function hideAllPages() {
    document.querySelectorAll(".page").forEach(page => page.style.display = "none");
}

function showPage(pageId) {
    hideAllPages();
    const page = document.getElementById(`${pageId}-page`);
    if (page) page.style.display = "block";

    if (pageId === "my-tasks") renderTasks();
    if (pageId === "categories") renderCategories();
    if (pageId === "dashboard") renderRecentTasks();

    // Highlight active nav
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("data-page") === pageId) link.classList.add("active");
    });
}

/* =========================
   NAVIGATION LINKS
========================= */
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const pageName = this.getAttribute('data-page');
        showPage(pageName);
    });
});

/* =========================
   ADD TASK
========================= */
document.getElementById("task-form").addEventListener("submit", function(e) {
    e.preventDefault(); // prevent page reload
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

    this.reset();
    showPage("my-tasks"); // show tasks page after adding
});

/* =========================
   RENDER TASKS
========================= */
function renderTasks(tasksList = null) {
    const tbody = document.getElementById("tasks-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";
    const tasks = tasksList || getTasks();

    if (tasks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No tasks yet</td></tr>`;
        return;
    }

    tasks.forEach((task, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${task.title}</td>
            <td><span class="badge ${task.status === "Done" ? "bg-success" : "bg-warning"}">${task.status}</span></td>
            <td><span class="badge ${categoryStyles[task.category] || "bg-secondary"}">${task.category}</span></td>
            <td>${task.priority}</td>
            <td>${task.dueDate || "-"}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editTask(${index})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteTask(${index})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/* =========================
   DELETE TASK
========================= */
function deleteTask(index) {
    const tasks = getTasks();
    if (!confirm("Delete this task?")) return;

    tasks.splice(index, 1);
    saveTasks(tasks);
    renderTasks();
    renderCategories();
}

/* =========================
   EDIT TASK
========================= */
function editTask(index) {
    const tasks = getTasks();
    const task = tasks[index];

    document.getElementById("task-title").value = task.title;
    document.getElementById("task-description").value = task.description;
    document.getElementById("task-category").value = task.category;
    document.getElementById("task-priority").value = task.priority;
    document.getElementById("task-due-date").value = task.dueDate;

    tasks.splice(index, 1);
    saveTasks(tasks);

    showPage("add-task");
}

/* =========================
   CATEGORIES
========================= */
function renderCategories() {
    const container = document.getElementById("categories-container");
    container.innerHTML = "";

    const tasks = getTasks();
    if (tasks.length === 0) {
        container.innerHTML = `<p class="text-muted text-center">No categories yet</p>`;
        return;
    }

    const categoryCount = {};
    tasks.forEach(task => categoryCount[task.category] = (categoryCount[task.category] || 0) + 1);

    Object.keys(categoryCount).forEach(category => {
        const col = document.createElement("div");
        col.className = "col-md-4 mb-4";

        col.innerHTML = `
            <div class="card text-white ${categoryStyles[category] || "bg-dark"} category-card"
                 onclick="filterByCategory('${category}')">
                <div class="card-body text-center">
                    <h5 class="card-title">${category}</h5>
                    <p class="display-6">${categoryCount[category]}</p>
                    <small>Tasks</small>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

/* =========================
   FILTER BY CATEGORY
========================= */
function filterByCategory(category) {
    const tasks = getTasks().filter(task => task.category === category);
    renderTasks(tasks);
    showPage("my-tasks");
}

/* =========================
   RECENT TASKS (DASHBOARD)
========================= */
function renderRecentTasks() {
    const tasks = getTasks();
    const list = document.getElementById("recent-tasks-list");
    if (!list) return;

    list.innerHTML = "";

    if (tasks.length === 0) {
        list.innerHTML = "<p class='text-muted'>No tasks yet</p>";
        return;
    }

    tasks.slice(-5).reverse().forEach(task => {
        const item = document.createElement("div");
        item.className = "border rounded p-2 mb-2";

        item.innerHTML = `
            <strong>${task.title}</strong><br>
            <small>${task.category} | ${task.priority} | ${task.dueDate || 'No due date'}</small>
        `;

        list.appendChild(item);
    });
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
    showPage("add-task");
    renderTasks();
    renderCategories();
    renderRecentTasks();
});
