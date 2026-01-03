// Global chart instances
let completionChart, categoryChart, priorityChart;

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
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
}

function showPage(pageId) {
    hideAllPages();
    const page = document.getElementById(`${pageId}-page`);
    if (page) page.classList.add("active");

    // Update active nav link
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("data-page") === pageId) link.classList.add("active");
    });

    // Page-specific rendering
    if (pageId === "dashboard") {
        renderRecentTasks();
        updateTaskStats();
    }
    if (pageId === "my-tasks") renderTasks();
    if (pageId === "categories") renderCategories();
    if (pageId === "analytics") renderAnalytics();
}

/* =========================
   NAVIGATION
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
    if (!title) return alert("Task title is required!");

    const description = document.getElementById("task-description").value.trim();
    const category = document.getElementById("task-category").value;
    const priority = document.getElementById("task-priority").value;
    const dueDate = document.getElementById("task-due-date").value;
    const editIndex = document.getElementById("task-edit-index").value;

    const tasks = getTasks();

    if (editIndex !== "") {
        tasks[editIndex] = { ...tasks[editIndex], title, description, category, priority, dueDate };
        document.getElementById("task-edit-index").value = "";
    } else {
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
    refreshAll();
    showPage("my-tasks");
});

/* =========================
   TASK ACTIONS
========================= */
function deleteTask(index) {
    if (!confirm("Delete this task?")) return;
    const tasks = getTasks();
    tasks.splice(index, 1);
    saveTasks(tasks);
    refreshAll();
}

function editTask(index) {
    const tasks = getTasks();
    const task = tasks[index];

    document.getElementById("task-title").value = task.title;
    document.getElementById("task-description").value = task.description;
    document.getElementById("task-category").value = task.category;
    document.getElementById("task-priority").value = task.priority;
    document.getElementById("task-due-date").value = task.dueDate || "";
    document.getElementById("task-edit-index").value = index;

    showPage("add-task");
}

function toggleTaskStatus(index) {
    const tasks = getTasks();
    tasks[index].status = tasks[index].status === "Pending" ? "Done" : "Pending";
    saveTasks(tasks);
    refreshAll();
}

/* =========================
   RENDER FUNCTIONS
========================= */
function renderTasks(tasksList = null) {
    const tbody = document.getElementById("tasks-table-body");
    if (!tbody) return;

    const tasks = tasksList || getTasks();
    tbody.innerHTML = "";

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

function renderRecentTasks() {
    const list = document.getElementById("recent-tasks-list");
    if (!list) return;

    const tasks = getTasks();
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
            <div class="card text-white ${categoryStyles[category] || "bg-dark"} category-card" onclick="filterByCategory('${category}')">
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

function filterByCategory(category) {
    const tasks = getTasks().filter(t => t.category === category);
    renderTasks(tasks);
    showPage("my-tasks");
}

/* =========================
   ANALYTICS & STATS
========================= */
function updateTaskStats() {
    const tasks = getTasks();

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Done").length;
    const pending = total - completed;

    const today = new Date();
    const upcoming = tasks.filter(t => t.dueDate && new Date(t.dueDate) > today && t.status !== "Done").length;

    // Dashboard stats
    ["total-tasks", "completed-tasks", "pending-tasks", "upcoming-tasks"].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.textContent = [total, completed, pending, upcoming][i];
    });

    // Completion rate
    const rate = total ? Math.round((completed / total) * 100) : 0;
    const bar = document.getElementById("completion-rate-bar");
    const text = document.getElementById("completion-rate-text");
    if (bar) bar.style.width = `${rate}%`;
    if (text) text.textContent = `${rate}%`;

    // Average tasks per day
    if (tasks.length === 0) {
        document.getElementById("avg-tasks-per-day").textContent = "0";
    } else {
        const dates = tasks.map(t => new Date(t.createdAt).getTime());
        const days = (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24) + 1;
        document.getElementById("avg-tasks-per-day").textContent = Math.round(total / days);
    }

    // Most productive day
    const dayCount = {};
    tasks.forEach(t => {
        const day = new Date(t.createdAt).toISOString().split("T")[0];
        dayCount[day] = (dayCount[day] || 0) + 1;
    });

    let mostProductiveDay = "undefined";
    if (Object.keys(dayCount).length > 0) {
        mostProductiveDay = Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b);
    }
    document.getElementById("most-productive-day").textContent = mostProductiveDay;
}

function renderAnalytics() {
    const tasks = getTasks();

    // Destroy old charts
    [completionChart, categoryChart, priorityChart].forEach(chart => chart?.destroy());

    // Completion Chart
    const completed = tasks.filter(t => t.status === "Done").length;
    const pending = tasks.length - completed;
    const ctx1 = document.getElementById("completionChart")?.getContext("2d");
    if (ctx1) {
        completionChart = new Chart(ctx1, {
            type: "doughnut",
            data: {
                labels: ["Completed", "Pending"],
                datasets: [{ data: [completed, pending], backgroundColor: ["#28a745", "#ffc107"] }]
            },
            options: { plugins: { legend: { position: "bottom" } } }
        });
    }

    // Category Chart
    const categoryCount = {};
    tasks.forEach(t => categoryCount[t.category] = (categoryCount[t.category] || 0) + 1);
    const ctx2 = document.getElementById("categoryChart")?.getContext("2d");
    if (ctx2) {
        categoryChart = new Chart(ctx2, {
            type: "pie",
            data: {
                labels: Object.keys(categoryCount),
                datasets: [{
                    data: Object.values(categoryCount),
                    backgroundColor: ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#0dcaf0", "#6f42c1"]
                }]
            },
            options: { plugins: { legend: { position: "bottom" } } }
        });
    }

    // Priority Chart
    const priorityCount = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach(t => priorityCount[t.priority]++);
    const ctx3 = document.getElementById("priorityChart")?.getContext("2d");
    if (ctx3) {
        priorityChart = new Chart(ctx3, {
            type: "bar",
            data: {
                labels: ["High", "Medium", "Low"],
                datasets: [{
                    label: "Tasks",
                    data: [priorityCount.High, priorityCount.Medium, priorityCount.Low],
                    backgroundColor: "#6f42c1"
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }
}

/* =========================
   REFRESH ALL
========================= */
function refreshAll() {
    renderTasks();
    renderCategories();
    renderRecentTasks();
    updateTaskStats();
    renderAnalytics();
}

/* =========================
   FILTER PAGE
========================= */
document.getElementById("apply-filter")?.addEventListener("click", () => {
    const tasks = getTasks();
    const today = new Date().toISOString().split("T")[0];

    const statusFilters = [];
    if (document.getElementById("filter-completed").checked) statusFilters.push("Done");
    if (document.getElementById("filter-pending").checked) statusFilters.push("Pending");

    const priorityFilters = [];
    if (document.getElementById("filter-high").checked) priorityFilters.push("High");
    if (document.getElementById("filter-medium").checked) priorityFilters.push("Medium");
    if (document.getElementById("filter-low").checked) priorityFilters.push("Low");

    const category = document.getElementById("filter-category").value;
    const dateType = document.getElementById("filter-due-date").value;

    let filtered = tasks.filter(task => {
        if (statusFilters.length && !statusFilters.includes(task.status)) return false;
        if (priorityFilters.length && !priorityFilters.includes(task.priority)) return false;
        if (category !== "all" && task.category !== category) return false;

        if (dateType === "today" && task.dueDate !== today) return false;
        if (dateType === "overdue" && (!task.dueDate || new Date(task.dueDate) >= new Date(today))) return false;
        if (dateType === "tomorrow") {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split("T")[0];
            if (task.dueDate !== tomorrowStr) return false;
        }
        if (dateType === "week") {
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() + 7);
            if (!task.dueDate || new Date(task.dueDate) > weekEnd) return false;
        }
        if (dateType === "future" && (!task.dueDate || new Date(task.dueDate) <= new Date(today))) return false;

        return true;
    });

    filtered.sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));

    const list = document.getElementById("filtered-tasks-list");
    list.innerHTML = "";
    if (filtered.length === 0) {
        list.innerHTML = "<p class='text-muted'>No tasks found</p>";
        return;
    }

    filtered.forEach(task => {
        const div = document.createElement("div");
        div.className = "border rounded p-3 mb-2";
        div.innerHTML = `
            <h6>${task.title}</h6>
            <small>
                Status: <strong>${task.status}</strong><br>
                Priority: <strong>${task.priority}</strong><br>
                Category: <strong>${task.category}</strong><br>
                Due: <strong>${task.dueDate || "No due date"}</strong>
            </small>
        `;
        list.appendChild(div);
    });
});

document.getElementById("reset-filter")?.addEventListener("click", () => {
    document.querySelectorAll("#filter-page input[type=checkbox]").forEach(cb => cb.checked = false);
    document.getElementById("filter-pending").checked = true;
    document.getElementById("filter-high").checked = true;
    document.getElementById("filter-medium").checked = true;
    document.getElementById("filter-low").checked = true;
    document.getElementById("filter-category").value = "all";
    document.getElementById("filter-due-date").value = "all";
    document.getElementById("filtered-tasks-list").innerHTML = "";
});

/* =========================
   SETTINGS & DARK MODE
========================= */
document.getElementById("dark-mode-toggle")?.addEventListener("change", function() {
    const settings = JSON.parse(localStorage.getItem("settings") || "{}");
    if (this.checked) {
        document.body.classList.add("dark-mode");
        settings.darkMode = true;
    } else {
        document.body.classList.remove("dark-mode");
        settings.darkMode = false;
    }
    localStorage.setItem("settings", JSON.stringify(settings));
});
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

        // Apply dark mode immediately
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

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "task-manager-data.json";
        link.click();
    });
});



/* =========================
   INITIALIZATION
========================= */
document.addEventListener("DOMContentLoaded", () => {
    // Create hidden edit index input if missing
    if (!document.getElementById("task-edit-index")) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.id = "task-edit-index";
        document.getElementById("task-form").appendChild(input);
    }

    // Load dark mode
    const settings = JSON.parse(localStorage.getItem("settings") || "{}");
    if (settings.darkMode) {
        document.body.classList.add("dark-mode");
        document.getElementById("dark-mode-toggle").checked = true;
    }

    // Default page
    showPage("dashboard");
    refreshAll();
});


