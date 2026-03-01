/**
 * Main Layout Component - Updated to match Figma design
 * Issue #56 - Sidebar layout, container system, navigation logic
 */

const appContainer = document.getElementById('app');

// ============================================
// SIDEBAR COMPONENT - Figma Design
// ============================================

function createSidebar(currentRoute = '/projects') {
    const user = authService.getUser();
    const userInitial = user && (user.full_name || user.fullName)
        ? (user.full_name || user.fullName).charAt(0).toUpperCase()
        : 'U';

    return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="user-profile-header">
                    <div class="user-avatar-header">
                        ${userInitial
                            ? userInitial
                            : `<img src="assets/icons/si_user-fill.svg" alt="User" style="width:24px;height:24px;filter:brightness(0) invert(1);">`}
                    </div>
                    <div class="user-info-header">
                        <p class="username-header">${user ? (user.full_name || user.fullName || 'Username') : 'Username'}</p>
                    </div>
                    <button class="notification-btn" onclick="toggleNotifications(this)">
                        <img src="assets/icons/basil_notification-on-solid.svg" alt="Notifications" class="notification-icon">
                    </button>
                </div>
            </div>

            <nav class="sidebar-nav">
                <div class="nav-section">
                    <button class="nav-item nav-item-dropdown ${currentRoute === '/projects' || currentRoute.startsWith('/project/') ? 'active' : ''}" onclick="toggleProjectsDropdown(this)">
                        <span class="nav-icon">
                            <img src="assets/icons/material-symbols_border-all-rounded.svg" alt="Projects" class="icon">
                        </span>
                        <span class="nav-text">Projects</span>
                        <span class="dropdown-arrow" id="projectsArrow">
                            <img src="assets/icons/ARROW Frame.svg" alt="▼" class="dropdown-icon">
                        </span>
                    </button>
                    <div class="projects-dropdown" id="projectsDropdown">
                        <div class="project-item" onclick="router.navigate('/project/11')">
                            <span class="project-name">Project 11</span>
                            <img src="assets/icons/next_vector.svg" class="project-next-icon" alt="">
                            <div class="project-progress">
                                <span class="project-progress-text">80h 00m 00s / 100h 00m 00s</span>
                                <div class="project-progress-bar">
                                    <div class="project-progress-fill" style="width: 80%; background: #4CAF50;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="project-item" onclick="router.navigate('/project/12')">
                            <span class="project-name">Project 12</span>
                            <img src="assets/icons/next_vector.svg" class="project-next-icon" alt="">
                            <div class="project-progress">
                                <span class="project-progress-text">30h 00m 00s / 100h 00m 00s</span>
                                <div class="project-progress-bar">
                                    <div class="project-progress-fill" style="width: 30%; background: #9C27B0;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="project-item" onclick="router.navigate('/project/13')">
                            <span class="project-name">Project 13</span>
                            <img src="assets/icons/next_vector.svg" class="project-next-icon" alt="">
                            <div class="project-progress">
                                <span class="project-progress-text">60h 00m 00s / 100h 00m 00s</span>
                                <div class="project-progress-bar">
                                    <div class="project-progress-fill" style="width: 60%; background: #CDDC39;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <a href="#/add-goal" class="nav-item ${currentRoute === '/add-goal' ? 'active' : ''}" data-route="/add-goal">
                    <span class="nav-icon">
                        <img src="assets/icons/carbon_add-filled.svg" alt="Add Goal" class="icon">
                    </span>
                    <span class="nav-text">Add goal</span>
                </a>

                <a href="#/statistics" class="nav-item ${currentRoute === '/statistics' ? 'active' : ''}" data-route="/statistics">
                    <span class="nav-icon">
                        <img src="assets/icons/solar_chart-bold.svg" alt="Statistics" class="icon">
                    </span>
                    <span class="nav-text">Statistics</span>
                </a>

                <a href="#/completed" class="nav-item ${currentRoute === '/completed' ? 'active' : ''}" data-route="/completed">
                    <span class="nav-icon">
                        <img src="assets/icons/checkmark_icon.svg" alt="Completed" class="icon">
                    </span>
                    <span class="nav-text">Completed</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <div class="sidebar-footer-controls">
                    <button class="theme-btn" onclick="toggleTheme(this)" title="Toggle theme">
                        <img src="assets/icons/Dark.svg" alt="Toggle theme" id="themeIcon">
                    </button>
                </div>
                <button class="nav-item logout-btn" onclick="handleLogout()">
                    <span class="nav-icon">
                        <img src="assets/icons/exit_vector.svg" alt="Logout" class="icon">
                    </span>
                    <span class="nav-text">Logout</span>
                </button>
            </div>
        </aside>
    `;
}

// Toggle projects dropdown
window.toggleProjectsDropdown = function(btn) {
    const dropdown = document.getElementById('projectsDropdown');
    const arrowImg = document.querySelector('#projectsArrow .dropdown-icon');
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
        if (arrowImg) arrowImg.style.transform = 'rotate(180deg)';
    } else {
        dropdown.style.display = 'none';
        if (arrowImg) arrowImg.style.transform = 'rotate(0deg)';
    }
};

// Toggle notification icon on/off
window.toggleNotifications = function(btn) {
    const img = btn.querySelector('.notification-icon');
    if (img.src.includes('notification-on')) {
        img.src = 'assets/icons/basil_notification-off-solid.svg';
        img.alt = 'Notifications off';
    } else {
        img.src = 'assets/icons/basil_notification-on-solid.svg';
        img.alt = 'Notifications on';
    }
};

// Toggle light/dark theme
window.toggleTheme = function(btn) {
    const img = btn.querySelector('img');
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        img.src = 'assets/icons/Dark.svg';
        img.alt = 'Switch to dark mode';
    } else {
        document.body.classList.add('dark-mode');
        img.src = 'assets/icons/Light.svg';
        img.alt = 'Switch to light mode';
    }
};


// ============================================
// LAYOUT CONTAINER
// ============================================

function createLayout(content, currentRoute = '/projects') {
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
// NAVIGATION LOGIC
// ============================================

function attachNavigationListeners() {
    document.querySelectorAll('.nav-item:not(.nav-item-dropdown)').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const route = item.getAttribute('data-route');

            document.querySelectorAll('.nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });

            item.classList.add('active');
            router.navigate(route);
        });
    });
}


// ============================================
// CONTENT RENDERERS
// ============================================

function renderProjectsContent() {
    return `
        <div class="page-header">
            <h1>Projects</h1>
        </div>
        
        <div class="projects-content">
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
            <div class="search-bar">
                <input type="text" placeholder="Search projects..." class="search-input">
            </div>
        </div>
        
        <div class="statistics-content">
            <div class="stats-cards">
                <div class="stat-card-large">
                    <h3>Insights</h3>
                    <div class="insights-tabs">
                        <button class="tab-btn">Day</button>
                        <button class="tab-btn active">Week</button>
                        <button class="tab-btn">Month</button>
                    </div>
                    <p class="stat-date">Feb1 - Feb7, 2026</p>
                    <div class="stat-summary">
                        <div><span class="stat-label">Total</span><span class="stat-value">38h 20m</span></div>
                        <div><span class="stat-label">Average</span><span class="stat-value">5h 37m</span></div>
                    </div>
                    <div class="chart-placeholder">
                        <p>Bar chart will be here</p>
                    </div>
                </div>
                
                <div class="stat-card-large">
                    <h3>Breakdown</h3>
                    <div class="insights-tabs">
                        <button class="tab-btn active">Day</button>
                        <button class="tab-btn">Week</button>
                        <button class="tab-btn">Month</button>
                    </div>
                    <p class="stat-date">Feb 2, 2026</p>
                    <div class="circular-chart">
                        <div class="circle-placeholder">3h 25m</div>
                    </div>
                    <div class="project-breakdown">
                        <div class="breakdown-item">
                            <span class="breakdown-color" style="background: #4CAF50;"></span>
                            <span>Project 11</span>
                            <div class="breakdown-bar" style="width: 80%; background: #4CAF50;"></div>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-color" style="background: #9C27B0;"></span>
                            <span>Project 12</span>
                            <div class="breakdown-bar" style="width: 50%; background: #9C27B0;"></div>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-color" style="background: #CDDC39;"></span>
                            <span>Project 13</span>
                            <div class="breakdown-bar" style="width: 30%; background: #CDDC39;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCompletedContent() {
    return `
        <div class="page-header">
            <h1>Completed</h1>
            <div class="search-bar">
                <input type="text" placeholder="Search completed projects..." class="search-input">
            </div>
        </div>
        
        <div class="completed-content">
            <div class="completed-filters">
                <button class="filter-btn active">All time</button>
                <button class="filter-btn">Past week</button>
                <button class="clear-all-btn">Clear all</button>
            </div>
            
            <div class="completed-list">
                <div class="completed-item">
                    <div class="completed-icon" style="background: #00BCD4;">
                        <img src="assets/icons/rivet-icons_check-all.svg" alt="✓" style="width:24px;height:24px;filter:brightness(0) invert(1);">
                    </div>
                    <div class="completed-info">
                        <h4>Project1</h4>
                        <p>10h 00m / 10h 00m</p>
                    </div>
                    <span class="completed-score">10</span>
                    <div class="completed-progress" style="background: #00BCD4; width: 100%;"></div>
                    <button class="completed-check">
                        <img src="assets/icons/rivet-icons_check-all.svg" alt="✓" style="width:18px;height:18px;filter:brightness(0) invert(1);">
                    </button>
                </div>

                <div class="completed-item">
                    <div class="completed-icon" style="background: #9C27B0;">
                        <img src="assets/icons/rivet-icons_check-all.svg" alt="✓" style="width:24px;height:24px;filter:brightness(0) invert(1);">
                    </div>
                    <div class="completed-info">
                        <h4>Project2</h4>
                        <p>40h 00m / 40h 00m</p>
                    </div>
                    <span class="completed-score">10</span>
                    <div class="completed-progress" style="background: #9C27B0; width: 100%;"></div>
                    <button class="completed-check">
                        <img src="assets/icons/rivet-icons_check-all.svg" alt="✓" style="width:18px;height:18px;filter:brightness(0) invert(1);">
                    </button>
                </div>

                <div class="completed-item">
                    <div class="completed-icon" style="background: #CDDC39;">
                        <img src="assets/icons/rivet-icons_check-all.svg" alt="✓" style="width:24px;height:24px;filter:brightness(0) invert(1);">
                    </div>
                    <div class="completed-info">
                        <h4>Project3</h4>
                        <p>35h 00m / 35h 00m</p>
                    </div>
                    <span class="completed-score">10</span>
                    <div class="completed-progress" style="background: #CDDC39; width: 100%;"></div>
                    <button class="completed-check">
                        <img src="assets/icons/rivet-icons_check-all.svg" alt="✓" style="width:18px;height:18px;filter:brightness(0) invert(1);">
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderProjectDetailContent(projectId) {
    return `
        <div class="page-header">
            <h1>Project ${projectId}</h1>
        </div>
        
        <div class="project-detail-content">
            <div class="project-tabs">
                <button class="project-tab active">Today</button>
                <button class="project-tab">Total</button>
            </div>
            
            <div class="project-today-stats">
                <p>0h 45m / 2h 30m</p>
                <div class="progress-bar-large">
                    <div class="progress-fill-large" style="width: 30%;"></div>
                </div>
                <span class="progress-percentage">30%</span>
            </div>
            
            <div class="project-time-tabs">
                <button class="time-tab active">Week</button>
                <button class="time-tab">Month</button>
                <button class="time-tab">3 Months</button>
            </div>
            
            <div class="project-stats-summary">
                <div><span>Total</span><span class="stat-large">13h 20m</span></div>
                <div><span>Average</span><span class="stat-large">1h 54m</span></div>
            </div>
            
            <div class="week-chart">
                <p>Weekly bar chart will be here</p>
                <div class="week-labels">
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>Th</span><span>F</span><span>S</span>
                </div>
            </div>
            
            <div class="view-controls">
                <button class="view-control-btn" title="Expand">
                    <img src="assets/icons/Bigger_vector.svg" alt="Expand">
                </button>
                <button class="view-control-btn" title="Compress">
                    <img src="assets/icons/smaller_vector.svg" alt="Compress">
                </button>
            </div>

            <div class="timer-controls">
                <button class="timer-btn" title="Reset">
                    <img src="assets/icons/reset_vector.svg" alt="Reset">
                </button>
                <button class="timer-btn timer-btn-primary" title="Play">
                    <img src="assets/icons/play_vector.svg" alt="Play">
                </button>
                <button class="timer-btn" title="Pause" style="display:none;" id="pauseBtn">
                    <img src="assets/icons/Pause.svg" alt="Pause">
                </button>
                <button class="timer-btn" title="Next session">
                    <img src="assets/icons/Vector.svg" alt="Next">
                </button>
            </div>
        </div>
    `;
}


// ============================================
// UPDATED RENDER FUNCTIONS
// ============================================

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

function renderProjectDetail(projectId) {
    const content = renderProjectDetailContent(projectId);
    appContainer.innerHTML = createLayout(content, `/project/${projectId}`);
    attachNavigationListeners();
}

// Redirect /app to /projects
function renderDashboard() {
    router.navigate('/projects');
}

function renderGoal(goalId) {
    renderProjectDetail(goalId);
}


window.renderDashboard = renderDashboard;
window.renderProjects = renderProjects;
window.renderAddGoal = renderAddGoal;
window.renderStatistics = renderStatistics;
window.renderCompleted = renderCompleted;
window.renderGoal = renderGoal;
window.renderProjectDetail = renderProjectDetail;
window.createLayout = createLayout;
window.attachNavigationListeners = attachNavigationListeners;