/**
 * Main Application
 * Initialize app and register routes with protection
 */

const appContainer = document.getElementById('app');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (authService.isAuthed()) {
        authService.fetchUser().catch(err => {
            console.error('Failed to fetch user:', err);
        });
    }
});

// Register routes with protection
router.on('/login', () => {
    renderLogin();
});

router.on('/register', () => {
    renderRegister();
});

router.on('/app', protectedRoute(() => {
    renderDashboard();
}));

router.on('/goal/:id', protectedRoute((params) => {
    renderGoal(params.id);
}));

// ============ ROUTE HANDLERS ============

function renderLogin() {
    appContainer.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <h1 class="logo">Continuum</h1>
                <h2>Login</h2>
                <form id="loginForm">
                    <input type="email" id="email" placeholder="Email" required />
                    <input type="password" id="password" placeholder="Password" required />
                    <button type="submit">Sign In</button>
                </form>
                <p>Don't have an account? <a href="#/register">Sign up</a></p>
            </div>
        </div>
    `;
    
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        Spinner.show('Logging in...');
        
        try {
            await authService.login(email, password);
            Toast.success('Welcome back!');
            router.navigate('/app');
        } catch (err) {
            Toast.error(err.message || 'Login failed');
        } finally {
            Spinner.hide();
        }
    });
}

function renderRegister() {
    appContainer.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <h1 class="logo">Continuum</h1>
                <h2>Register</h2>
                <form id="registerForm">
                    <input type="text" id="name" placeholder="Full Name" required />
                    <input type="email" id="email" placeholder="Email" required />
                    <input type="password" id="password" placeholder="Password" required />
                    <input type="password" id="rePassword" placeholder="Confirm Password" required />
                    <button type="submit">Sign Up</button>
                </form>
                <p>Already have an account? <a href="#/login">Sign in</a></p>
            </div>
        </div>
    `;
    
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rePassword = document.getElementById('rePassword').value;
        
        if (password !== rePassword) {
            Toast.error('Passwords do not match');
            return;
        }
        
        Spinner.show('Creating account...');
        
        try {
            await authService.register(name, email, password, rePassword);
            Toast.success('Account created successfully!');
            router.navigate('/app');
        } catch (err) {
            Toast.error(err.message || 'Registration failed');
        } finally {
            Spinner.hide();
        }
    });
}

function renderDashboard() {
    const user = authService.getUser();
    
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
                <div style="padding: 20px; margin-top: auto;">
                    <p style="color: #666; margin-bottom: 10px;">
                        ${user ? user.fullName || user.email : 'User'}
                    </p>
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
