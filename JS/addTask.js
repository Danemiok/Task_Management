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
});
