// Get DOM elements
const loginPage = document.getElementById('login-page');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout');
const userNameEl = document.querySelector('.user-details h6');
const userEmailEl = document.querySelector('.user-details small');

// Task form elements
const taskForm = document.getElementById('task-form');
const cancelTaskBtn = document.getElementById('cancel-task');

// Sidebar navigation
const navLinks = document.querySelectorAll('#sidebar .nav-link');
const pages = document.querySelectorAll('.page');

// ----- LOGIN / REGISTER -----
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('login-name').value;
    const email = document.getElementById('login-email').value;
    const theme = document.getElementById('login-theme').value;

    // Save user info in localStorage
    const user = { name, email, theme };
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Apply theme
    applyTheme(theme);

    // Update user info in sidebar
    updateUserInfo(user);

    // Show app, hide login
    loginPage.style.display = 'none';
    appContainer.style.display = 'block';
});

// Logout button
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    loginPage.style.display = 'block';
    appContainer.style.display = 'none';
});

// Load user if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        loginPage.style.display = 'none';
        appContainer.style.display = 'block';
        applyTheme(currentUser.theme);
        updateUserInfo(currentUser);
    }
});

function updateUserInfo(user) {
    userNameEl.textContent = user.name;
    userEmailEl.textContent = user.email;
}

// ----- THEME -----
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else if (theme === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    } else if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-mode', prefersDark);
        document.body.classList.toggle('light-mode', !prefersDark);
    }
}

// ----- SIDEBAR NAVIGATION -----
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.dataset.page;

        pages.forEach(p => p.style.display = 'none');
        const activePage = document.getElementById(`${pageId}-page`);
        if (activePage) activePage.style.display = 'block';

        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// ----- TASK FORM -----
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const category = document.getElementById('task-category').value;
    const priority = document.getElementById('task-priority').value;
    const dueDate = document.getElementById('task-due-date').value;

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ title, description, category, priority, dueDate, createdAt: new Date() });
    localStorage.setItem('tasks', JSON.stringify(tasks));

    alert('Task added successfully!');
    taskForm.reset();
});

// Cancel button
cancelTaskBtn.addEventListener('click', () => {
    taskForm.reset();
});
