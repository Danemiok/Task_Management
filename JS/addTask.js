const saveTaskBtn = document.getElementById('saveTask');

saveTaskBtn.addEventListener('click', () => {
    const title = document.getElementById('taskTitle').value.trim();
    const desc = document.getElementById('taskDesc').value.trim();
    const due = document.getElementById('taskDue').value;

    if (!title) {
        alert('Task title is required');
        return;
    }

    const newTask = {
        title,
        description: desc,
        dueDate: due,
        createdAt: new Date().toISOString()
    };

    const tasks = JSON.parse(localStorage.getItem('taskManagerTasks')) || [];
    tasks.push(newTask);
    localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));

    // Reset form
    document.getElementById('taskForm').reset();

    // Close modal
    const modal = bootstrap.Modal.getInstance(
        document.getElementById('addTaskModal')
    );
    modal.hide();

    renderRecentTasks();
// ../JS/addTask.js

document.addEventListener("DOMContentLoaded", () => {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    // ===== Elements =====
    const pages = document.querySelectorAll(".page");
    const navLinks = document.querySelectorAll(".nav-link");

    const taskForm = document.getElementById("task-form");
    const cancelTaskBtn = document.getElementById("cancel-task");

    const totalTasksEl = document.getElementById("total-tasks");
    const completedTasksEl = document.getElementById("completed-tasks");
    const pendingTasksEl = document.getElementById("pending-tasks");
    const upcomingTasksEl = document.getElementById("upcoming-tasks");
    const recentTasksList = document.getElementById("recent-tasks-list");
    const currentDateEl = document.getElementById("current-date");

    // ===== Show current date =====
    if (currentDateEl) {
        const d = new Date();
        const formattedDate =
            d.getFullYear() + "-" +
            String(d.getMonth() + 1).padStart(2, "0") + "-" +
            String(d.getDate()).padStart(2, "0");
        currentDateEl.textContent = formattedDate; // Example: 2025-12-31
    }
    // showPage("dashboard");

    // ===== Navigation =====
    navLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const page = link.dataset.page;
            showPage(page);
        });
    });

    function showPage(page) {
        pages.forEach(p => p.classList.remove("active"));
        navLinks.forEach(l => l.classList.remove("active"));

        const targetPage = document.getElementById(page + "-page");
        const targetLink = document.querySelector(`[data-page="${page}"]`);

        if (targetPage) targetPage.classList.add("active");
        if (targetLink) targetLink.classList.add("active");
    }

    // ===== Add Task =====
    if (taskForm) {
        taskForm.addEventListener("submit", e => {
            e.preventDefault();

            const task = {
                id: Date.now(),
                title: document.getElementById("task-title").value,
                description: document.getElementById("task-description").value,
                category: document.getElementById("task-category").value,
                priority: document.getElementById("task-priority").value,
                date: document.getElementById("date").value,
                status: "pending",
                createdAt: new Date()
            };

            tasks.push(task);
            localStorage.setItem("tasks", JSON.stringify(tasks));

            taskForm.reset();
            updateDashboard();
            showPage("dashboard");
        });
    }

    // ===== Cancel Button =====
    if (cancelTaskBtn) {
        cancelTaskBtn.addEventListener("click", () => {
            showPage("dashboard");
            taskForm.reset();
        });
    }
    
    // ===== Dashboard =====
    function updateDashboard() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === "completed").length;
        const pending = total - completed;

        const upcoming = tasks.filter(t => {
            if (!t.date) return false;
            const due = new Date(t.date);
            const today = new Date();
            const diff = (due - today) / (1000 * 60 * 60 * 24);
            return diff >= 0 && diff <= 3;
        }).length;

        totalTasksEl.textContent = total;
        completedTasksEl.textContent = completed;
        pendingTasksEl.textContent = pending;
        upcomingTasksEl.textContent = upcoming;

        renderRecentTasks();
    }

    function renderRecentTasks() {
        recentTasksList.innerHTML = "";

        if (tasks.length === 0) {
            recentTasksList.innerHTML = "<p class='text-muted'>No tasks yet</p>";
            return;
        }

        tasks.slice(-5).reverse().forEach(task => {
            const div = document.createElement("div");
            div.className = "border-bottom py-2";
            div.innerHTML = `
                <strong>${task.title}</strong>
                <div class="small text-muted">
                    ${task.category} • ${task.priority} • ${new Date(task.createdAt).toLocaleString()}
                </div>
            `;
            recentTasksList.appendChild(div);
        });
    }

    // ===== Init =====
    updateDashboard();
    showPage("dashboard");
});
