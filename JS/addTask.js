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
    if (pageId === "dashboard") {
        renderRecentTasks();
        updateTaskStats();
    }

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
   ADD / UPDATE TASK
========================= */
document.getElementById("task-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const title = document.getElementById("task-title").value.trim();
    const description = document.getElementById("task-description").value.trim();
    const category = document.getElementById("task-category").value;
    const priority = document.getElementById("task-priority").value;
    const dueDate = document.getElementById("task-due-date").value;
    const editIndex = document.getElementById("task-edit-index").value;

    if (!title) return alert("Task title is required!");

    const tasks = getTasks();

    if (editIndex !== "") {
        // Update existing task
        tasks[editIndex] = {
            ...tasks[editIndex],
            title,
            description,
            category,
            priority,
            dueDate
        };
        document.getElementById("task-edit-index").value = "";
    } else {
        // Add new task
        tasks.push({
            title,
            description,
            category,
            priority,
            dueDate,
            status: "Pending",
            createdAt: new Date().toISOString()
        });
    }

    saveTasks(tasks);
    this.reset();

    refreshAll(); // update tasks, categories, dashboard
    showPage("my-tasks");
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
                <button class="btn btn-sm btn-success" onclick="toggleTaskStatus(${index})"><i class="fas fa-check"></i></button>
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
    refreshAll();
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
    document.getElementById("task-edit-index").value = index;

    showPage("add-task");
}

/* =========================
   TOGGLE TASK STATUS
========================= */
function toggleTaskStatus(index) {
    const tasks = getTasks();
    tasks[index].status = tasks[index].status === "Pending" ? "Done" : "Pending";
    saveTasks(tasks);
    refreshAll();
}

/* =========================
   CATEGORIES
========================= */
function renderCategories() {
    const container = document.getElementById("categories-container");
    if (!container) return;
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

function filterTasks({ category = null, priority = null, status = null } = {}) {
    let tasks = getTasks();

    if (category) tasks = tasks.filter(t => t.category === category);
    if (priority) tasks = tasks.filter(t => t.priority === priority);
    if (status) tasks = tasks.filter(t => t.status === status);

    renderTasks(tasks);
    showPage("my-tasks");
}

function filterByCategory(category) {
    filterTasks({ category });
}

/* =========================
   DASHBOARD: RECENT TASKS
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
   STATS & CHARTS
========================= */
let completionChart, categoryChart, priorityChart;

function updateTaskStats() {
    const tasks = getTasks();

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Done").length;
    const pending = tasks.filter(t => t.status !== "Done").length;

    const today = new Date();
    const upcoming = tasks.filter(t => t.dueDate && new Date(t.dueDate) > today).length;

    // Update dashboard stats
    const statIds = ["total-tasks", "completed-tasks", "pending-tasks", "upcoming-tasks"];
    [total, completed, pending, upcoming].forEach((val, i) => {
        const el = document.getElementById(statIds[i]);
        if (el) el.textContent = val;
    });

    // Completion rate
    const rate = total ? Math.round((completed / total) * 100) : 0;
    const bar = document.getElementById("completion-rate-bar");
    const text = document.getElementById("completion-rate-text");
    if (bar) bar.style.width = rate + "%";
    if (text) text.textContent = rate + "%";

    // Average tasks per day
    const createdDates = tasks.map(t => new Date(t.createdAt));
    const days = createdDates.length ? (Math.max(...createdDates) - Math.min(...createdDates)) / (1000*60*60*24) + 1 : 1;
    const avgEl = document.getElementById("avg-tasks-per-day");
    if (avgEl) avgEl.textContent = Math.round(total / days);

    // Most productive day
    const dayCount = {};
    createdDates.forEach(d => {
        const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
        dayCount[key] = (dayCount[key] || 0) + 1;
    });
    const mostProductiveDay = Object.keys(dayCount).reduce((a,b) => dayCount[a] > dayCount[b] ? a : b, null);
    const mostEl = document.getElementById("most-productive-day");
    if (mostEl) mostEl.textContent = mostProductiveDay || "N/A";

    // Update charts
    updateCharts();
}

function updateCharts() {
    const tasks = getTasks();

    // --- Completion Chart ---
    const completed = tasks.filter(t => t.status === "Done").length;
    const pending = tasks.filter(t => t.status !== "Done").length;
    const ctx1 = document.getElementById("completionChart")?.getContext("2d");
    if (ctx1) {
        if(completionChart) completionChart.destroy();
        completionChart = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: ["Completed", "Pending"],
                datasets: [{
                    data: [completed, pending],
                    backgroundColor: ["#28a745", "#ffc107"]
                }]
            }
        });
    }

    // --- Tasks by Category ---
    const categoryCount = {};
    tasks.forEach(t => categoryCount[t.category] = (categoryCount[t.category] || 0) + 1);
    const ctx2 = document.getElementById("categoryChart")?.getContext("2d");
    if (ctx2) {
        if(categoryChart) categoryChart.destroy();
        categoryChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: Object.keys(categoryCount),
                datasets: [{
                    label: 'Tasks',
                    data: Object.values(categoryCount),
                    backgroundColor: "#17a2b8"
                }]
            }
        });
    }

    // --- Tasks by Priority ---
    const priorityCount = {};
    tasks.forEach(t => priorityCount[t.priority] = (priorityCount[t.priority] || 0) + 1);
    const ctx3 = document.getElementById("priorityChart")?.getContext("2d");
    if (ctx3) {
        if(priorityChart) priorityChart.destroy();
        priorityChart = new Chart(ctx3, {
            type: 'bar',
            data: {
                labels: Object.keys(priorityCount),
                datasets: [{
                    label: 'Tasks',
                    data: Object.values(priorityCount),
                    backgroundColor: "#6f42c1"
                }]
            }
        });
    }
}

/* =========================
   REFRESH ALL DATA
========================= */
function refreshAll() {
    renderTasks();
    renderCategories();
    renderRecentTasks();
    updateTaskStats();
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
    // Hidden input to store edit index
    if (!document.getElementById("task-edit-index")) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.id = "task-edit-index";
        document.getElementById("task-form").appendChild(input);
    }

    showPage("add-task");
    refreshAll();
});


// --------- filter Tasks ---------------

document.addEventListener("DOMContentLoaded", () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const list = document.getElementById("filtered-tasks-list");

    // ===== Helper: get today date =====
    function getToday() {
        return new Date().toISOString().split("T")[0];
    }

    // ===== Render Tasks =====
    function renderTasks(tasksToRender) {
        list.innerHTML = "";

        if (tasksToRender.length === 0) {
            list.innerHTML = `<p class="text-muted">No tasks found</p>`;
            return;
        }

        tasksToRender.forEach(task => {
            const div = document.createElement("div");
            div.className = "border rounded p-3 mb-2";

            div.innerHTML = `
                <h6>${task.title}</h6>
                <small>
                    Status: <strong>${task.status}</strong><br>
                    Priority: <strong>${task.priority}</strong><br>
                    Category: <strong>${task.category}</strong><br>
                    Due Date: <strong>${task.dueDate}</strong>
                </small>
            `;

            list.appendChild(div);
        });
    }

    // ===== Apply Filter =====
    document.getElementById("apply-filter").addEventListener("click", () => {
        const today = getToday();

        // Status
        const statusFilter = [];
        if (document.getElementById("filter-completed").checked) statusFilter.push("completed");
        if (document.getElementById("filter-pending").checked) statusFilter.push("pending");

        // Priority
        const priorityFilter = [];
        if (document.getElementById("filter-high").checked) priorityFilter.push("High");
        if (document.getElementById("filter-medium").checked) priorityFilter.push("Medium");
        if (document.getElementById("filter-low").checked) priorityFilter.push("Low");

        // Category & Date
        const category = document.getElementById("filter-category").value;
        const dateType = document.getElementById("filter-due-date").value;

        const filteredTasks = tasks.filter(task => {
            if (statusFilter.length && !statusFilter.includes(task.status)) return false;
            if (priorityFilter.length && !priorityFilter.includes(task.priority)) return false;
            if (category !== "all" && task.category !== category) return false;

            if (dateType === "today" && task.dueDate !== today) return false;
            if (dateType === "overdue" && task.dueDate >= today) return false;
            if (dateType === "future" && task.dueDate <= today) return false;

            return true;
        });

        // Optional: sort by due date
        filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        renderTasks(filteredTasks);
    });

    // ===== Reset Filter =====
    document.getElementById("reset-filter").addEventListener("click", () => {
        // Clear all filter inputs
        document.getElementById("filter-completed").checked = false;
        document.getElementById("filter-pending").checked = false;
        document.getElementById("filter-high").checked = false;
        document.getElementById("filter-medium").checked = false;
        document.getElementById("filter-low").checked = false;
        document.getElementById("filter-category").value = "all";
        document.getElementById("filter-due-date").value = "all";

        // Clear the task list
        list.innerHTML = "";
    });
});


// ------ Analytics------

document.addEventListener("DOMContentLoaded", () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    // ===== BASIC COUNTS =====
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    // ===== COMPLETION RATE =====
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    document.getElementById("completion-rate-bar").style.width = completionRate + "%";
    document.getElementById("completion-rate-text").textContent = completionRate + "%";

    // ===== TASKS PER DAY =====
    const tasksByDay = {};
    tasks.forEach(t => {
        tasksByDay[t.date] = (tasksByDay[t.date] || 0) + 1;
    });

    const days = Object.keys(tasksByDay).length || 1;
    document.getElementById("avg-tasks-per-day").textContent =
        Math.round(totalTasks / days);

    // ===== MOST PRODUCTIVE DAY =====
    let bestDay = "N/A";
    let max = 0;
    for (let day in tasksByDay) {
        if (tasksByDay[day] > max) {
            max = tasksByDay[day];
            bestDay = day;
        }
    }
    document.getElementById("most-productive-day").textContent = bestDay;

    // ===== COMPLETION CHART =====
    new Chart(document.getElementById("completionChart"), {
        type: "doughnut",
        data: {
            labels: ["Completed", "Pending"],
            datasets: [{
                data: [completedTasks, pendingTasks]
            }]
        }
    });

    // ===== CATEGORY CHART =====
    const categoryCount = {};
    tasks.forEach(t => {
        categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
    });

    new Chart(document.getElementById("categoryChart"), {
        type: "pie",
        data: {
            labels: Object.keys(categoryCount),
            datasets: [{
                data: Object.values(categoryCount)
            }]
        }
    });

    // ===== PRIORITY CHART =====
    const priorityCount = {};
    tasks.forEach(t => {
        priorityCount[t.priority] = (priorityCount[t.priority] || 0) + 1;
    });

    new Chart(document.getElementById("priorityChart"), {
        type: "bar",
        data: {
            labels: Object.keys(priorityCount),
            datasets: [{
                data: Object.values(priorityCount)
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
});



// ---- setting -----

document.addEventListener("DOMContentLoaded", () => {
    // ===== Elements =====
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const emailNoti = document.getElementById("email-notifications");
    const browserNoti = document.getElementById("browser-notifications");
    const dueDateReminders = document.getElementById("due-date-reminders");
    const saveBtn = document.getElementById("save-settings");
    const clearBtn = document.getElementById("clear-data");
    const exportBtn = document.getElementById("export-data");

    // ===== Load Settings =====
    const settings = JSON.parse(localStorage.getItem("settings")) || {
        darkMode: false,
        email: true,
        browser: true,
        reminders: true
    };

    // Apply settings
    darkModeToggle.checked = settings.darkMode;
    emailNoti.checked = settings.email;
    browserNoti.checked = settings.browser;
    dueDateReminders.checked = settings.reminders;

    if (settings.darkMode) {
        document.body.classList.add("dark-mode");
    }

    // ===== Save Settings =====
    saveBtn.addEventListener("click", () => {
        const newSettings = {
            darkMode: darkModeToggle.checked,
            email: emailNoti.checked,
            browser: browserNoti.checked,
            reminders: dueDateReminders.checked
        };

        localStorage.setItem("settings", JSON.stringify(newSettings));

        document.body.classList.toggle("dark-mode", newSettings.darkMode);

        alert("Settings saved successfully!");
    });

    // ===== Clear All Data =====
    clearBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all data?")) {
            localStorage.clear();
            location.reload();
        }
    });

    // ===== Export Data =====
    exportBtn.addEventListener("click", () => {
        const data = {
            settings: JSON.parse(localStorage.getItem("settings")),
            tasks: JSON.parse(localStorage.getItem("tasks"))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json"
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "task-manager-data.json";
        link.click();
    });
});




