
// Load tasks 
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateDashboard();
}

function updateDashboard() {
    // Sort tasks by due date
    tasks.sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const today = new Date().toISOString().split('T')[0];
    const upcoming = tasks.filter(t => !t.completed && t.dueDate && t.dueDate >= today).length;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
    document.getElementById('upcomingTasks').textContent = upcoming;

    const taskList = document.getElementById('taskList');
    const noTasks = document.getElementById('noTasks');

    if (tasks.length === 0) {
        taskList.style.display = 'none';
        noTasks.style.display = 'block';
    } else {
        noTasks.style.display = 'none';
        taskList.style.display = 'block';
        taskList.innerHTML = tasks.slice(0, 10).map(task => `
          <li class="list-group-item d-flex justify-content-between align-items-center ${task.completed ? 'completed-task' : ''}">
            <div>
              <strong>${task.title}</strong><br>
              <small class="text-muted">${task.description || 'No description'}</small>
              ${task.dueDate ? `<br><small class="text-muted">Due: ${task.dueDate}</small>` : ''}
            </div>
            ${task.completed
                ? '<span class="badge bg-success">Completed</span>'
                : `<button class="btn btn-sm btn-success complete-btn" data-id="${task.id}">Complete</button>`
            }
          </li>
        `).join('');
    }

    // Complete button
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.dataset.id);
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = true;
                saveTasks();
            }
        });
    });
}

// Add new task
document.getElementById('saveTask').addEventListener('click', function () {
    const title = document.getElementById('taskTitle').value.trim();
    const dueDate = document.getElementById('taskDue').value;

    if (!title) return;

    // Due date validation
    if (dueDate && new Date(dueDate).getTime() < new Date().setHours(0, 0, 0, 0)) {
        alert('Due date cannot be in the past');
        return;
    }

    tasks.unshift({
        id: Date.now(),
        title,
        description: document.getElementById('taskDesc').value.trim(),
        dueDate: dueDate || null,
        completed: false,
        createdAt: new Date().toISOString()
    });

    document.getElementById('taskForm').reset();
    const modalEl = document.getElementById('addTaskModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.hide();

    saveTasks();
});

// Initial load
updateDashboard();