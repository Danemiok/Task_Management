document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        // Activate nav link
        document.querySelectorAll('.nav-link').forEach(item => {
            item.classList.remove('active');
        });
        this.classList.add('active');

        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const pageName = this.getAttribute('data-page');
        const targetPage = document.getElementById(`${pageName}-page`);

        if (targetPage) {
            targetPage.classList.add('active');
        }
    });
});


function renderRecentTasks() {
    const tasks = JSON.parse(localStorage.getItem('taskManagerTasks'));
    const list = document.getElementById('recent-tasks-list');

    list.innerHTML = '';

    if (tasks.length === 0) {
        list.innerHTML = '<p class="text-muted">No tasks yet</p>';
        return;
    }

    tasks.slice(-5).reverse().forEach(task => {
        const item = document.createElement('div');
        item.className = 'border rounded p-2 mb-2';

        item.innerHTML = `
            <strong>${task.title}</strong><br>
            <small>
                ${task.category} | ${task.priority} | ${task.dueDate || 'No due date'}
            </small>
        `;

        list.appendChild(item);
    });
}
