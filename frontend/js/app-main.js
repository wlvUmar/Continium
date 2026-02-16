import './api.js';
import './auth.js';
import './route-protection.js';
import './ui-utilities.js';
import './router.js';
import './auth-pages.js';
import './layout.js';
import './goals-list.js';
import router from './router.js';

const appContainer = document.getElementById('app');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (authService && authService.isAuthed()) {
        authService.fetchUser().catch(err => {
            console.error('Failed to fetch user:', err);
        });
    }
});

// Register all routes
router.on('/login', () => {
    renderLogin();
});

router.on('/register', () => {
    renderRegister();
});

router.on('/verify', () => {
    renderVerification();
});

router.on('/forgot-password', () => {
    renderForgotPassword();
});

router.on('/app', protectedRoute(() => {
    renderDashboard();
}));

router.on('/goal/:id', protectedRoute((params) => {
    renderGoal(params.id);
}));

// Default route
router.on('/', () => {
    if (authService && authService.isAuthed()) {
        router.navigate('/app');
    } else {
        router.navigate('/login');
    }
});

// ============ DASHBOARD (Protected) ============
function renderDashboard() {
    const user = authService.getUser();
    
    appContainer.innerHTML = `
        <div class="dashboard">
            <aside class="sidebar">
                <h1 class="logo">Continuum</h1>
                <nav>
                    <a href="#/app" class="active">
                        <span class="nav-icon">📊</span>
                        Dashboard
                    </a>
                    <a href="#/projects">
                        <span class="nav-icon">📋</span>
                        Projects
                    </a>
                    <a href="#/statistics">
                        <span class="nav-icon">📈</span>
                        Statistics
                    </a>
                    <a href="#/completed">
                        <span class="nav-icon">✅</span>
                        Completed
                    </a>
                </nav>
                <div class="sidebar-footer">
                    <div class="user-info">
                        <div class="user-avatar">
                            ${user && user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <p class="user-name">
                            ${user ? user.fullName || user.email : 'User'}
                        </p>
                    </div>
                    <button onclick="handleLogout()" class="btn-logout">
                        Logout
                    </button>
                </div>
            </aside>
            <main class="main-content">
                <h1>Dashboard</h1>
                <p>Welcome to your project dashboard!</p>
                <div class="projects-grid">
                    <div class="project-card" onclick="router.navigate('/goal/1')">
                        <h3>Project 1</h3>
                        <p>Click to view details</p>
                    </div>
                </div>
            </main>
        </div>
    `;
}

function renderGoal(goalId) {
    appContainer.innerHTML = `
        <div class="dashboard">
            <aside class="sidebar">
                <h1 class="logo">Continuum</h1>
                <nav>
                    <a href="#/app">
                        <span class="nav-icon">📊</span>
                        Dashboard
                    </a>
                    <a href="#/projects">
                        <span class="nav-icon">📋</span>
                        Projects
                    </a>
                </nav>
            </aside>
            <main class="main-content">
                <button onclick="router.navigate('/app')">← Back</button>
                <h1>Goal #${goalId}</h1>
                <div class="goal-details">
                    <p>Goal details will be displayed here</p>
                </div>
            </main>
        </div>
    `;
}
