/**
 * Main Layout Component
 * Issue #56 - Sidebar layout, container system, navigation logic
 */

// ============================================
// SIDEBAR COMPONENT - Issue #73
// ============================================

function createSidebar(currentRoute = '/app') {
    const user = authService.getUser();
    const userInitial = user && user.fullName 
        ? user.fullName.charAt(0).toUpperCase() 
        : 'U';
    
    return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <h1 class="sidebar-logo">Continuum</h1>
            </div>
            
            <nav class="sidebar-nav">
                <a href="#/app" class="nav-item ${currentRoute === '/app' ? 'active' : ''}" data-route="/app">
                    <span class="nav-icon">📊</span>
                    <span class="nav-text">Dashboard</span>
                </a>
                
                <a href="#/projects" class="nav-item ${currentRoute === '/projects' ? 'active' : ''}" data-route="/projects">
                    <span class="nav-icon">📋</span>
                    <span class="nav-text">Projects</span>
                </a>
                
                <a href="#/add-goal" class="nav-item ${currentRoute === '/add-goal' ? 'active' : ''}" data-route="/add-goal">
                    <span class="nav-icon">➕</span>
                    <span class="nav-text">Add Goal</span>
                </a>
                
                <a href="#/statistics" class="nav-item ${currentRoute === '/statistics' ? 'active' : ''}" data-route="/statistics">
                    <span class="nav-icon">📈</span>
                    <span class="nav-text">Statistics</span>
                </a>
                
                <a href="#/completed" class="nav-item ${currentRoute === '/completed' ? 'active' : ''}" data-route="/completed">
                    <span class="nav-icon">✅</span>
                    <span class="nav-text">Completed</span>
                </a>
            </nav>
            
            <div class="sidebar-footer">
                <div class="user-profile">
                    <div class="user-avatar">
                        ${userInitial}
                    </div>
                    <div class="user-details">
                        <p class="user-name">${user ? user.fullName || user.email : 'User'}</p>
                        <p class="user-email">${user ? user.email : ''}</p>
                    </div>
                </div>
                <button onclick="handleLogout()" class="btn-logout">
                    <span class="logout-icon">🚪</span>
                    Logout
                </button>
            </div>
        </aside>
    `;
}


// ============================================
// LAYOUT CONTAINER - Issue #74
// ============================================

function createLayout(content, currentRoute = '/app') {
    return `
        <div class="app-layout">
            ${createSidebar(currentRoute)}
            <main class="main-container">
                ${content}
            </main>
        </div>
    `;
}


// ============================================
// NAVIGATION LOGIC - Issue #75
// ============================================

function attachNavigationListeners() {
    // Add click listeners to all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const route = item.getAttribute('data-route');
            
            // Remove active class from all items
            document.querySelectorAll('.nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Navigate to route
            router.navigate(route);
        });
    });
}


// ============================================
// CONTENT RENDERERS
// ============================================

function renderDashboardContent() {
    const user = authService.getUser();
    
    return `
        <div class="page-header">
            <h1>Dashboard</h1>
            <p class="page-subtitle">Welcome back, ${user ? user.fullName || 'User' : 'User'}!</p>
        </div>
        
        <div class="dashboard-content">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-info">
                        <h3>Active Projects</h3>
                        <p class="stat-value">0</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-info">
                        <h3>Completed</h3>
                        <p class="stat-value">0</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-info">
                        <h3>Total Time</h3>
                        <p class="stat-value">0h</p>
                    </div>
                </div>
            </div>
            
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h2>No projects yet</h2>
                <p>Start by creating your first project</p>
                <button onclick="router.navigate('/add-goal')" class="btn-primary">
                    Create Project
                </button>
            </div>
        </div>
    `;
}

function renderProjectsContent() {
    return `
        <div class="page-header">
            <h1>Projects</h1>
            <button onclick="router.navigate('/add-goal')" class="btn-primary">
                ➕ New Project
            </button>
        </div>
        
        <div class="projects-content">
            <div class="empty-state">
                <div class="empty-icon">📁</div>
                <h2>No projects</h2>
                <p>Create your first project to get started</p>
            </div>
        </div>
    `;
}

function renderAddGoalContent() {
    return `
        <div class="page-header">
            <h1>Add New Goal</h1>
            <p class="page-subtitle">Create a new project or goal to track</p>
        </div>
        
        <div class="add-goal-content">
            <div class="form-card">
                <h3>Coming soon...</h3>
                <p>Goal creation form will be here</p>
            </div>
        </div>
    `;
}

function renderStatisticsContent() {
    return `
        <div class="page-header">
            <h1>Statistics</h1>
            <p class="page-subtitle">Track your progress and achievements</p>
        </div>
        
        <div class="statistics-content">
            <div class="empty-state">
                <div class="empty-icon">📈</div>
                <h2>No data yet</h2>
                <p>Start tracking projects to see statistics</p>
            </div>
        </div>
    `;
}

function renderCompletedContent() {
    return `
        <div class="page-header">
            <h1>Completed</h1>
            <p class="page-subtitle">Your finished projects and achievements</p>
        </div>
        
        <div class="completed-content">
            <div class="empty-state">
                <div class="empty-icon">🎉</div>
                <h2>No completed projects</h2>
                <p>Complete your first project to see it here</p>
            </div>
        </div>
    `;
}


// ============================================
// UPDATED RENDER FUNCTIONS
// ============================================

function renderDashboard() {
    const content = renderDashboardContent();
    appContainer.innerHTML = createLayout(content, '/app');
    attachNavigationListeners();
}

function renderProjects() {
    const content = renderProjectsContent();
    appContainer.innerHTML = createLayout(content, '/projects');
    attachNavigationListeners();
}

function renderAddGoal() {
    const content = renderAddGoalContent();
    appContainer.innerHTML = createLayout(content, '/add-goal');
    attachNavigationListeners();
}

function renderStatistics() {
    const content = renderStatisticsContent();
    appContainer.innerHTML = createLayout(content, '/statistics');
    attachNavigationListeners();
}

function renderCompleted() {
    const content = renderCompletedContent();
    appContainer.innerHTML = createLayout(content, '/completed');
    attachNavigationListeners();
}

function renderGoal(goalId) {
    const content = `
        <div class="page-header">
            <button onclick="router.navigate('/projects')" class="btn-back">
                ← Back
            </button>
            <h1>Goal #${goalId}</h1>
        </div>
        
        <div class="goal-content">
            <p>Goal details will be displayed here</p>
        </div>
    `;
    
    appContainer.innerHTML = createLayout(content, '/projects');
    attachNavigationListeners();
}


// Export functions
window.renderDashboard = renderDashboard;
window.renderProjects = renderProjects;
window.renderAddGoal = renderAddGoal;
window.renderStatistics = renderStatistics;
window.renderCompleted = renderCompleted;
window.renderGoal = renderGoal;
