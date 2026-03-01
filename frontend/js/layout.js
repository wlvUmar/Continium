/**
 * Main Layout Component - Updated to match Figma design
 * Issue #56 - Sidebar layout, container system, navigation logic
 */

const appContainer = document.getElementById('app');

// Timer state
let _timerInterval = null;
let _timerRunning = false;
let _timerElapsed = 0;
let _timerGoalSeconds = 9000; // 2h 30m default
const TIMER_CIRCUMFERENCE = 565.49; // 2 * PI * 90

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
                <div class="user-profile-header user-profile-header--clickable" onclick="router.navigate('/profile')" title="View profile">
                    <div class="user-avatar-header">
                        <img src="assets/icons/si_user-fill.svg" alt="User" style="width:28px;height:28px;filter:brightness(0) invert(1);">
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
                            <div class="sidebar-project-row">
                                <button class="sidebar-play-btn" onclick="event.stopPropagation(); router.navigate('/project/11')" title="Start">
                                    <img src="assets/icons/play_vector.svg" alt="Play">
                                </button>
                                <span class="project-name">Project 11</span>
                                <img src="assets/icons/next_vector.svg" class="project-next-icon" alt="">
                            </div>
                            <div class="project-progress">
                                <span class="project-progress-text">80h 00m / 100h 00m</span>
                                <div class="project-progress-bar">
                                    <div class="project-progress-fill" style="width: 80%; background: #4CAF50;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="project-item" onclick="router.navigate('/project/12')">
                            <div class="sidebar-project-row">
                                <button class="sidebar-play-btn" onclick="event.stopPropagation(); router.navigate('/project/12')" title="Start">
                                    <img src="assets/icons/play_vector.svg" alt="Play">
                                </button>
                                <span class="project-name">Project 12</span>
                                <img src="assets/icons/next_vector.svg" class="project-next-icon" alt="">
                            </div>
                            <div class="project-progress">
                                <span class="project-progress-text">49h 10m / 82h 00m</span>
                                <div class="project-progress-bar">
                                    <div class="project-progress-fill" style="width: 60%; background: #9C27B0;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="project-item" onclick="router.navigate('/project/13')">
                            <div class="sidebar-project-row">
                                <button class="sidebar-play-btn" onclick="event.stopPropagation(); router.navigate('/project/13')" title="Start">
                                    <img src="assets/icons/play_vector.svg" alt="Play">
                                </button>
                                <span class="project-name">Project 13</span>
                                <img src="assets/icons/next_vector.svg" class="project-next-icon" alt="">
                            </div>
                            <div class="project-progress">
                                <span class="project-progress-text">33h 40m / 84h 00m</span>
                                <div class="project-progress-bar">
                                    <div class="project-progress-fill" style="width: 40%; background: #CDDC39;"></div>
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
window.toggleTheme = function() {
    const isDark = document.body.classList.toggle('dark-mode');
    const lightBtn = document.querySelector('.theme-opt-light');
    const darkBtn = document.querySelector('.theme-opt-dark');
    if (lightBtn) lightBtn.classList.toggle('active', !isDark);
    if (darkBtn) darkBtn.classList.toggle('active', isDark);
};


// ============================================
// LAYOUT CONTAINER
// ============================================

function createLayout(content, currentRoute = '/projects') {
    const isDark = document.body.classList.contains('dark-mode');
    return `
        <div class="app-layout">
            ${createSidebar(currentRoute)}
            <main class="main-container">
                ${content}
            </main>
        </div>
        <div class="theme-toggle-pill">
            <button class="theme-opt theme-opt-light ${isDark ? '' : 'active'}" onclick="toggleTheme()" title="Light mode">
                <img src="assets/icons/Light.svg" alt="Light">
            </button>
            <button class="theme-opt theme-opt-dark ${isDark ? 'active' : ''}" onclick="toggleTheme()" title="Dark mode">
                <img src="assets/icons/Dark.svg" alt="Dark">
            </button>
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
            <form class="add-goal-form" onsubmit="handleAddGoalSubmit(event)">
                <div class="form-group">
                    <label class="form-label">Goal Name</label>
                    <input type="text" name="title" class="form-input" placeholder="e.g. Learn Spanish" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Color</label>
                    <div class="color-picker-row">
                        <button type="button" class="color-swatch active" style="background:#4CAF50;" onclick="selectGoalColor('#4CAF50', this)"></button>
                        <button type="button" class="color-swatch" style="background:#00BCD4;" onclick="selectGoalColor('#00BCD4', this)"></button>
                        <button type="button" class="color-swatch" style="background:#9C27B0;" onclick="selectGoalColor('#9C27B0', this)"></button>
                        <button type="button" class="color-swatch" style="background:#F44336;" onclick="selectGoalColor('#F44336', this)"></button>
                        <button type="button" class="color-swatch" style="background:#FF9800;" onclick="selectGoalColor('#FF9800', this)"></button>
                        <input type="hidden" name="color" id="goalColor" value="#4CAF50">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Frequency Type</label>
                    <div class="freq-type-tabs">
                        <button type="button" class="freq-tab active" data-type="repeating" onclick="selectFreqType('repeating', this)">Repeating</button>
                        <button type="button" class="freq-tab" data-type="onetime" onclick="selectFreqType('onetime', this)">One-time</button>
                    </div>
                </div>

                <div class="freq-options" id="freqRepeating">
                    <div class="form-group">
                        <label class="form-label">Repeat</label>
                        <div class="repeat-group">
                            <button type="button" class="repeat-btn active" onclick="selectRepeat('daily', this)">Daily</button>
                            <button type="button" class="repeat-btn" onclick="selectRepeat('weekly', this)">Weekly</button>
                            <button type="button" class="repeat-btn" onclick="selectRepeat('monthly', this)">Monthly</button>
                        </div>
                        <input type="hidden" name="frequency" id="goalFrequency" value="daily">
                    </div>
                </div>

                <div class="freq-options hidden" id="freqOnetime">
                    <div class="form-group form-group-row">
                        <div class="form-group-half">
                            <label class="form-label">Start Date</label>
                            <input type="date" name="start_date" class="form-input">
                        </div>
                        <div class="form-group-half">
                            <label class="form-label">End Date</label>
                            <input type="date" name="end_date" class="form-input">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Session Count</label>
                        <input type="number" name="session_count" class="form-input" placeholder="e.g. 10" min="1">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Daily Target Hours</label>
                    <input type="number" name="daily_target_hours" class="form-input" placeholder="e.g. 2.5" step="0.5" min="0.5" max="24">
                </div>

                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="router.navigate('/projects')">Cancel</button>
                    <button type="submit" class="btn-primary" id="addGoalSubmitBtn">Create Goal</button>
                </div>
            </form>
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
        </div>

        <!-- Happy character banner — swap img src when designer delivers the asset -->
        <div class="completed-banner">
            <div class="completed-banner-text">
                <p class="completed-banner-label">Keep it up!</p>
                <h2 class="completed-banner-title">You're crushing it 🎉</h2>
                <p class="completed-banner-sub">All your finished goals are here</p>
            </div>
            <div class="completed-banner-img">
                <!-- TODO: replace with <img src="assets/icons/happy_character.svg" alt=""> -->
            </div>
        </div>

        <div class="search-bar-full">
            <input type="text" class="search-input-pill" placeholder="Search completed...">
        </div>

        <div class="completed-filter-row">
            <div class="insights-tabs">
                <button class="tab-btn active">All time</button>
                <button class="tab-btn">Past week</button>
                <button class="tab-btn">Past month</button>
            </div>
        </div>

        <div class="project-list-outer">
            <div class="project-list-card">
                <div class="project-done-circle" style="background:#00BCD4;">
                    <img src="assets/icons/checkmark_icon.svg" alt="Done">
                </div>
                <div class="project-list-info">
                    <span class="project-list-name">Project1</span>
                    <span class="project-list-time">10h 00m / 10h 00m</span>
                    <div class="project-list-bar">
                        <div class="project-list-bar-fill" style="width:100%; background:#00BCD4;"></div>
                    </div>
                </div>
                <span class="project-list-percent">10 ★</span>
                <img src="assets/icons/next_vector.svg" class="project-list-chevron" alt="">
            </div>

            <div class="project-list-card">
                <div class="project-done-circle" style="background:#9C27B0;">
                    <img src="assets/icons/checkmark_icon.svg" alt="Done">
                </div>
                <div class="project-list-info">
                    <span class="project-list-name">Project2</span>
                    <span class="project-list-time">40h 00m / 40h 00m</span>
                    <div class="project-list-bar">
                        <div class="project-list-bar-fill" style="width:100%; background:#9C27B0;"></div>
                    </div>
                </div>
                <span class="project-list-percent">10 ★</span>
                <img src="assets/icons/next_vector.svg" class="project-list-chevron" alt="">
            </div>

            <div class="project-list-card">
                <div class="project-done-circle" style="background:#CDDC39;">
                    <img src="assets/icons/checkmark_icon.svg" alt="Done">
                </div>
                <div class="project-list-info">
                    <span class="project-list-name">Project3</span>
                    <span class="project-list-time">35h 00m / 35h 00m</span>
                    <div class="project-list-bar">
                        <div class="project-list-bar-fill" style="width:100%; background:#CDDC39;"></div>
                    </div>
                </div>
                <span class="project-list-percent">10 ★</span>
                <img src="assets/icons/next_vector.svg" class="project-list-chevron" alt="">
            </div>
        </div>
    `;
}

function renderProjectDetailContent(projectId) {
    return `
        <div class="page-header">
            <h1>Project ${projectId}</h1>
        </div>

        <div class="project-detail-wrapper">
            <div class="project-main-tabs">
                <button class="project-main-tab active" onclick="switchProjectTab('today', this)">Today</button>
                <button class="project-main-tab" onclick="switchProjectTab('total', this)">Total</button>
            </div>

            <div class="timer-ring-container">
                <svg class="timer-ring-svg" width="220" height="220" viewBox="0 0 220 220">
                    <circle cx="110" cy="110" r="104" fill="none" stroke="#E8E8E8" stroke-width="4"/>
                    <circle cx="110" cy="110" r="90" fill="none" stroke="#F0F0F0" stroke-width="14"/>
                    <circle id="timerProgressArc" class="timer-ring-progress"
                        cx="110" cy="110" r="90"
                        fill="none" stroke="#00BCD4" stroke-width="14"
                        stroke-dasharray="565.49"
                        stroke-dashoffset="565.49"
                        stroke-linecap="round"
                        transform="rotate(-90 110 110)"/>
                </svg>
                <div class="timer-ring-center">
                    <span class="timer-display" id="timerDisplay">0:00:00</span>
                    <span class="timer-sublabel">elapsed</span>
                </div>
            </div>

            <div class="timer-goal-label" id="timerGoalLabel">Daily goal: 2h 30m</div>

            <div class="timer-controls">
                <button class="timer-btn" title="Reset" onclick="timerReset()">
                    <img src="assets/icons/reset_vector.svg" alt="Reset">
                </button>
                <button class="timer-btn timer-btn-primary" title="Play/Pause" onclick="timerToggle()">
                    <img src="assets/icons/play_vector.svg" alt="Play" id="playPauseIcon">
                </button>
                <button class="timer-btn" title="Next session" onclick="timerNext()">
                    <img src="assets/icons/Vector.svg" alt="Next">
                </button>
            </div>

            <div class="project-period-tabs" style="margin-top:32px;">
                <button class="period-tab active" onclick="switchPeriodTab('week', this)">Week</button>
                <button class="period-tab" onclick="switchPeriodTab('month', this)">Month</button>
                <button class="period-tab" onclick="switchPeriodTab('3months', this)">3 Months</button>
            </div>

            <div class="project-stats-summary">
                <div class="stats-summary-item">
                    <span class="stat-large">13h 20m</span>
                    <span style="font-size:13px;color:#999;">Total</span>
                </div>
                <div class="stats-summary-item">
                    <span class="stat-large">1h 54m</span>
                    <span style="font-size:13px;color:#999;">Average</span>
                </div>
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
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
    _timerRunning = false; _timerElapsed = 0;
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


// ============================================
// TIMER FUNCTIONS
// ============================================

function _updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    const arc = document.getElementById('timerProgressArc');
    if (!display || !arc) return;
    const h = Math.floor(_timerElapsed / 3600);
    const m = Math.floor((_timerElapsed % 3600) / 60);
    const s = _timerElapsed % 60;
    display.textContent = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    arc.style.strokeDashoffset = TIMER_CIRCUMFERENCE * (1 - Math.min(_timerElapsed / _timerGoalSeconds, 1));
}

window.timerToggle = function() {
    const icon = document.getElementById('playPauseIcon');
    if (_timerRunning) {
        clearInterval(_timerInterval); _timerRunning = false;
        if (icon) { icon.src = 'assets/icons/play_vector.svg'; icon.alt = 'Play'; }
    } else {
        _timerRunning = true;
        if (icon) { icon.src = 'assets/icons/Pause.svg'; icon.alt = 'Pause'; }
        _timerInterval = setInterval(() => { _timerElapsed++; _updateTimerDisplay(); }, 1000);
    }
};

window.timerReset = function() {
    clearInterval(_timerInterval); _timerRunning = false; _timerElapsed = 0;
    const icon = document.getElementById('playPauseIcon');
    if (icon) { icon.src = 'assets/icons/play_vector.svg'; icon.alt = 'Play'; }
    _updateTimerDisplay();
};

window.timerNext = function() { timerReset(); };

window.switchProjectTab = function(tab, btn) {
    document.querySelectorAll('.project-main-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
};

window.switchPeriodTab = function(period, btn) {
    document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
};


// ============================================
// ADD GOAL FORM FUNCTIONS
// ============================================

window.selectGoalColor = function(color, btn) {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('goalColor').value = color;
};

window.selectFreqType = function(type, btn) {
    document.querySelectorAll('.freq-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('freqRepeating').classList.toggle('hidden', type !== 'repeating');
    document.getElementById('freqOnetime').classList.toggle('hidden', type !== 'onetime');
};

window.selectRepeat = function(freq, btn) {
    document.querySelectorAll('.repeat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('goalFrequency').value = freq;
};

window.handleAddGoalSubmit = async function(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = document.getElementById('addGoalSubmitBtn');
    submitBtn.disabled = true; submitBtn.textContent = 'Creating...';
    const freqType = document.querySelector('.freq-tab.active')?.dataset.type || 'repeating';
    const goalData = {
        title: form.title.value.trim(),
        color: form.color.value,
        frequency_type: freqType,
        frequency: freqType === 'repeating' ? form.frequency.value : null,
        start_date: freqType === 'onetime' ? (form.start_date?.value || null) : null,
        end_date: freqType === 'onetime' ? (form.end_date?.value || null) : null,
        session_count: freqType === 'onetime' ? (parseInt(form.session_count?.value) || null) : null,
        daily_target_hours: parseFloat(form.daily_target_hours.value) || null,
    };
    try {
        await goalsService.createGoal(goalData);
        Toast.success('Goal created successfully!');
        router.navigate('/projects');
    } catch (err) {
        Toast.error(err.message || 'Failed to create goal');
        submitBtn.disabled = false; submitBtn.textContent = 'Create Goal';
    }
};


// ============================================
// PROFILE PAGE
// ============================================

function renderProfileContent() {
    const user = authService.getUser();
    const userInitial = user && (user.full_name || user.fullName)
        ? (user.full_name || user.fullName).charAt(0).toUpperCase()
        : 'U';
    const userName = user ? (user.full_name || user.fullName || 'User') : 'User';
    const userEmail = user ? (user.email || '') : '';
    const userBirthdate = user ? (user.birthdate || '') : '';
    return `
        <div class="page-header">
            <h1>Profile</h1>
        </div>

        <div class="profile-content">
            <div class="profile-avatar-section">
                <div class="profile-avatar-large">${userInitial}</div>
                <p class="profile-username">${userName}</p>
            </div>

            <form class="profile-form" onsubmit="handleProfileSave(event)">
                <p class="profile-section-title">Personal Information</p>

                <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" name="full_name" class="form-input" value="${userName}" placeholder="Your full name">
                </div>

                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" name="email" class="form-input" value="${userEmail}" placeholder="your@email.com">
                </div>

                <div class="form-group">
                    <label class="form-label">Birthdate</label>
                    <input type="date" name="birthdate" class="form-input" value="${userBirthdate}">
                </div>

                <p class="profile-section-title profile-section-title--mt">Change Password</p>

                <div class="form-group">
                    <label class="form-label">Current Password</label>
                    <input type="password" name="current_password" class="form-input" placeholder="Enter current password">
                </div>

                <div class="form-group">
                    <label class="form-label">New Password</label>
                    <input type="password" name="new_password" class="form-input" placeholder="Enter new password">
                </div>

                <div class="form-group">
                    <label class="form-label">Confirm New Password</label>
                    <input type="password" name="confirm_password" class="form-input" placeholder="Confirm new password">
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-primary" id="profileSaveBtn">Save Changes</button>
                </div>
            </form>
        </div>
    `;
}

function renderProfile() {
    const content = renderProfileContent();
    appContainer.innerHTML = createLayout(content, '/profile');
    attachNavigationListeners();
}

window.handleProfileSave = async function(event) {
    event.preventDefault();
    const form = event.target;
    const saveBtn = document.getElementById('profileSaveBtn');
    const newPw = form.new_password.value;
    const confirmPw = form.confirm_password.value;
    if (newPw && newPw !== confirmPw) { Toast.error('Passwords do not match'); return; }
    saveBtn.disabled = true; saveBtn.textContent = 'Saving...';
    const payload = {
        full_name: form.full_name.value.trim(),
        email: form.email.value.trim(),
        birthdate: form.birthdate.value || null,
    };
    if (newPw) { payload.current_password = form.current_password.value; payload.new_password = newPw; }
    try {
        const updated = await api.put('/auth/me', payload);
        if (updated) localStorage.setItem('user', JSON.stringify(updated));
        Toast.success('Profile saved!');
    } catch (err) {
        Toast.error(err.message || 'Failed to save profile');
    } finally { saveBtn.disabled = false; saveBtn.textContent = 'Save Changes'; }
};


window.renderDashboard = renderDashboard;
window.renderProjects = renderProjects;
window.renderAddGoal = renderAddGoal;
window.renderStatistics = renderStatistics;
window.renderCompleted = renderCompleted;
window.renderGoal = renderGoal;
window.renderProjectDetail = renderProjectDetail;
window.renderProfile = renderProfile;
window.createLayout = createLayout;
window.attachNavigationListeners = attachNavigationListeners;