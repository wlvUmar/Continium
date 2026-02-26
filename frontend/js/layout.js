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
    const userInitial = user && user.fullName
        ? user.fullName.charAt(0).toUpperCase()
        : 'U';

    return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="user-profile-header ${currentRoute === '/profile' ? 'active' : ''}" onclick="router.navigate('/profile')">
                    <div class="user-avatar-header">
                        ${userInitial}
                    </div>
                    <div class="user-info-header">
                        <p class="username-header">${user ? user.fullName || 'Username' : 'Username'}</p>
                    </div>
                    <button class="notification-btn">
                        <span class="notification-bell">🔔</span>
                    </button>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <div class="nav-section">
                    <div class="nav-item nav-item-dropdown ${currentRoute === '/projects' || currentRoute.startsWith('/project/') ? 'active' : ''}" style="display: flex; align-items: center; justify-content: space-between; cursor: default;">
                        <div class="nav-projects-main" onclick="router.navigate('/projects')" style="display: flex; align-items: center; gap: 14px; flex: 1; cursor: pointer;">
                            <span class="nav-icon">
                                <img src="assets/icons/material-symbols_border-all-rounded.svg" alt="Projects" class="icon" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22currentColor%22><path d=%22M3 3h8v8H3zm0 10h8v8H3zm10-10h8v8h-8zm0 10h8v8h-8z%22/></svg>'">
                            </span>
                            <span class="nav-text">Projects</span>
                        </div>
                        <span class="dropdown-chevron-circle" id="projectsArrow" onclick="toggleProjectsDropdown()" style="cursor: pointer;">▼</span>
                    </div>
                    <div class="projects-dropdown" id="projectsDropdown">
                        <div class="project-item" onclick="router.navigate('/project/11')">
                            <div class="project-play-icon">▶</div>
                            <div class="project-item-info">
                                <div class="project-item-header">
                                    <span class="project-name">Project 11</span>
                                    <span class="project-arrow">›</span>
                                </div>
                                <div class="project-item-progress">
                                    <span class="project-time-text">80h 00m / 100h 00m</span>
                                    <div class="project-mini-progress-bar">
                                        <div class="project-mini-progress-fill" style="width: 80%; background: #4CAF50;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="project-item" onclick="router.navigate('/project/12')">
                            <div class="project-play-icon">▶</div>
                            <div class="project-item-info">
                                <div class="project-item-header">
                                    <span class="project-name">Project 12</span>
                                    <span class="project-arrow">›</span>
                                </div>
                                <div class="project-item-progress">
                                    <span class="project-time-text">30h 00m / 100h 00m</span>
                                    <div class="project-mini-progress-bar">
                                        <div class="project-mini-progress-fill" style="width: 30%; background: #9C27B0;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="project-item" onclick="router.navigate('/project/13')">
                            <div class="project-play-icon">▶</div>
                            <div class="project-item-info">
                                <div class="project-item-header">
                                    <span class="project-name">Project 13</span>
                                    <span class="project-arrow">›</span>
                                </div>
                                <div class="project-item-progress">
                                    <span class="project-time-text">60h 00m / 100h 00m</span>
                                    <div class="project-mini-progress-bar">
                                        <div class="project-mini-progress-fill" style="width: 60%; background: #CDDC39;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <a href="#/add-goal" class="nav-item ${currentRoute === '/add-goal' ? 'active' : ''}" data-route="/add-goal">
                    <span class="nav-icon">+</span>
                    <span class="nav-text">Add goal</span>
                </a>
                
                <a href="#/statistics" class="nav-item ${currentRoute === '/statistics' ? 'active' : ''}" data-route="/statistics">
                    <span class="nav-icon">📊</span>
                    <span class="nav-text">Statistics</span>
                </a>
                
                <a href="#/completed" class="nav-item ${currentRoute === '/completed' ? 'active' : ''}" data-route="/completed">
                    <span class="nav-icon">✓</span>
                    <span class="nav-text">Completed</span>
                </a>
            </nav>
        </aside>
    `;
}

// Toggle projects dropdown
window.toggleProjectsDropdown = function () {
    const dropdown = document.getElementById('projectsDropdown');
    const arrow = document.getElementById('projectsArrow');
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
        arrow.textContent = '▲';
    } else {
        dropdown.style.display = 'none';
        arrow.textContent = '▼';
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
                    <div class="completed-icon" style="background: #00BCD4;">✓</div>
                    <div class="completed-info">
                        <h4>Project1</h4>
                        <p>10h 00m / 10h 00m</p>
                    </div>
                    <span class="completed-score">10</span>
                    <div class="completed-progress" style="background: #00BCD4; width: 100%;"></div>
                    <button class="completed-check">✓</button>
                </div>
                
                <div class="completed-item">
                    <div class="completed-icon" style="background: #9C27B0;">✓</div>
                    <div class="completed-info">
                        <h4>Project2</h4>
                        <p>40h 00m / 40h 00m</p>
                    </div>
                    <span class="completed-score">10</span>
                    <div class="completed-progress" style="background: #9C27B0; width: 100%;"></div>
                    <button class="completed-check">✓</button>
                </div>
                
                <div class="completed-item">
                    <div class="completed-icon" style="background: #CDDC39;">✓</div>
                    <div class="completed-info">
                        <h4>Project3</h4>
                        <p>35h 00m / 35h 00m</p>
                    </div>
                    <span class="completed-score">10</span>
                    <div class="completed-progress" style="background: #CDDC39; width: 100%;"></div>
                    <button class="completed-check">✓</button>
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
            
            <div class="play-button-container">
                <button class="play-button">
                    <img src="assets/icons/play_vector.svg" alt="Play">
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


function renderProfilePage() {
    const user = authService.getUser() || { fullName: 'Username', email: 'example@email.com' };
    const userInitial = user.fullName.charAt(0).toUpperCase();

    const content = `
        <div class="profile-page">
            <div class="profile-card-white">
                <div class="profile-header-inline">
                    <h1>Profile</h1>
                    <button class="profile-save-btn">Save</button>
                </div>

                <div class="user-summary-card">
                    <div class="profile-avatar-large">${userInitial}</div>
                    <div class="user-summary-info">
                        <h2>${user.fullName}</h2>
                        <p>${user.email}</p>
                    </div>
                </div>

                <div class="profile-section-card">
                    <div class="section-title-inline">
                        <img src="assets/icons/user_icon.svg" alt="" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22><path d=%22M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2%22/><circle cx=%2212%22 cy=%227%22 r=%224%22/></svg>'">
                        User information
                    </div>

                    <div class="profile-field-row">
                        <span class="field-label">Full Name</span>
                        <div class="field-input-wrapper">
                            <input type="text" class="profile-input" value="${user.fullName}">
                            <span class="edit-icon-profile">✎</span>
                        </div>
                    </div>

                    <div class="profile-field-row">
                        <span class="field-label">Email</span>
                        <div class="field-input-wrapper">
                            <input type="email" class="profile-input" value="${user.email}">
                            <span class="edit-icon-profile">✎</span>
                        </div>
                    </div>
                </div>

                <div class="settings-grid">
                    <div class="settings-group">
                        <h3>Theme</h3>
                        <div class="profile-segmented-control">
                            <button class="profile-segment-btn active">
                                <span class="theme-icon">☀️</span> Light mode
                            </button>
                            <button class="profile-segment-btn">
                                <span class="theme-icon">🌙</span> Dark mode
                            </button>
                        </div>
                    </div>
                    <div class="settings-group">
                        <h3>Notifications</h3>
                        <div class="profile-segmented-control">
                            <button class="profile-segment-btn active">
                                <span class="notif-icon">🔔</span> Notification on
                            </button>
                            <button class="profile-segment-btn">
                                <span class="notif-icon">🔕</span> Notification off
                            </button>
                        </div>
                    </div>
                </div>

                <div class="change-password-container">
                    <button class="btn-change-password">Change password</button>
                </div>
            </div>
        </div>
    `;

    appContainer.innerHTML = createLayout(content, '/profile');
    attachNavigationListeners();
}

window.renderProfilePage = renderProfilePage;
window.renderDashboard = renderDashboard;
window.renderProjects = renderProjects;
window.renderAddGoal = renderAddGoal;
window.renderStatistics = renderStatistics;
window.renderCompleted = renderCompleted;
window.renderGoal = renderGoal;
window.renderProjectDetail = renderProjectDetail;
window.createLayout = createLayout;
window.attachNavigationListeners = attachNavigationListeners;