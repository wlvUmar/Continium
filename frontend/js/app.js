/**
 * Main Application
 * Initialize app and register routes
 */

// Get main container
const appContainer = document.getElementById('app');

// Register routes
router.on('/login', () => {
    renderLogin();
});

router.on('/app', () => {
    renderDashboard();
});

router.on('/goal/:id', (params) => {
    renderGoal(params.id);
});

// Route handlers
function renderLogin() {
    appContainer.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <h1 class="logo">Continuum</h1>
                <h2>Login</h2>
                <form id="loginForm">
                    <input type="email" placeholder="Email" required />
                    <input type="password" placeholder="Password" required />
                    <button type="submit">Sign In</button>
                </form>
                <p>Don't have an account? <a href="#/register">Sign up</a></p>
            </div>
        </div>
    `;
}

function renderDashboard() {
    appContainer.innerHTML = `
        <div class="dashboard">
            <aside class="sidebar">
                <h1 class="logo">Continuum</h1>
                <nav>
                    <a href="#/app" class="active">Dashboard</a>
                    <a href="#/projects">Projects</a>
                    <a href="#/statistics">Statistics</a>
                    <a href="#/completed">Completed</a>
                </nav>
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
                    <a href="#/app">Dashboard</a>
                    <a href="#/projects">Projects</a>
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
