/**
 * Goals List Component
 * Issue #57 - Goals list UI and fetch functionality
 */

// ============================================
// GOALS API SERVICE
// ============================================

const goalsService = {
    // Fetch all goals
    async fetchGoals() {
        try {
            const goals = await api.get('/goals');
            return goals;
        } catch (err) {
            console.error('Failed to fetch goals:', err);
            throw err;
        }
    },

    // Fetch single goal
    async fetchGoal(goalId) {
        try {
            const goal = await api.get(`/goals/${goalId}`);
            return goal;
        } catch (err) {
            console.error('Failed to fetch goal:', err);
            throw err;
        }
    },

    // Create goal
    async createGoal(goalData) {
        try {
            const goal = await api.post('/goals', goalData);
            return goal;
        } catch (err) {
            console.error('Failed to create goal:', err);
            throw err;
        }
    },

    // Update goal
    async updateGoal(goalId, goalData) {
        try {
            const goal = await api.put(`/goals/${goalId}`, goalData);
            return goal;
        } catch (err) {
            console.error('Failed to update goal:', err);
            throw err;
        }
    },

    // Delete goal
    async deleteGoal(goalId) {
        try {
            await api.delete(`/goals/${goalId}`);
        } catch (err) {
            console.error('Failed to delete goal:', err);
            throw err;
        }
    }
};


// ============================================
// GOALS LIST UI - Issue #76
// ============================================

function createGoalCard(goal) {
    const progress = goal.progress || 0;
    const timeSpent = formatTime(goal.timeSpent || 0);
    const totalTime = formatTime(goal.totalTime || goal.timeSpent || 0);
    const colors = ['#FFA500', '#CDDC39', '#FF1493', '#00FF00', '#9C27B0', '#FFD700'];
    const colorIndex = goal.title ? goal.title.charCodeAt(0) % colors.length : 0;
    const barColor = colors[colorIndex];

    const gid = goal.id || goal._id;

    return `
        <div class="goal-card" onclick="router.navigate('/goal/${gid}')">
            <div class="goal-play-icon">
                <img src="assets/icons/play_vector.svg" alt="Play" style="width: 24px; height: 24px; filter: brightness(0) invert(1);">
            </div>
            <div class="goal-info">
                <div class="goal-header-row">
                    <h3 class="goal-title">${goal.title || 'Untitled Goal'}</h3>
                    <div class="goal-actions-mini">
                        <button class="btn-icon-mini edit-btn" onclick="event.stopPropagation(); window.showEditGoalModal('${gid}', '${(goal.title || '').replace(/'/g, "\\'")}', '${(goal.description || '').replace(/'/g, "\\'")}')" title="Edit Goal">
                            <span style="font-size: 18px;">✏️</span>
                        </button>
                        <button class="btn-icon-mini complete-btn" onclick="event.stopPropagation(); window.markGoalAsCompleted('${gid}')" title="Complete Goal">
                            <span style="font-size: 18px; color: #4CAF50;">✅</span>
                        </button>
                        <button class="btn-icon-mini delete-btn" onclick="event.stopPropagation(); window.promptDeleteGoal('${gid}')" title="Delete Goal">
                            <span style="font-size: 18px;">🗑️</span>
                        </button>
                    </div>
                </div>
                <p class="goal-description">${timeSpent} / ${totalTime}</p>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%; background: ${barColor};"></div>
                    </div>
                </div>
            </div>
            <span class="progress-percentage">${progress}%</span>
            <div class="goal-arrow">
                <img src="assets/icons/next_vector.svg" alt="Go" style="width: 20px; height: 20px; opacity: 0.5;">
            </div>
        </div>
    `;
}

function formatTime(seconds) {
    if (!seconds) return '0h';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function createGoalsList(goals) {
    if (!goals || goals.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h2>No goals yet</h2>
                <p>Start by creating your first goal to track progress</p>
                <button onclick="window.showAddGoalModal()" class="btn-primary">
                    ➕ Create Goal
                </button>
            </div>
        `;
    }

    return `
        <div class="goals-grid">
            ${goals.map(goal => createGoalCard(goal)).join('')}
        </div>
    `;
}

function createLoadingState() {
    return `
        <div class="loading-state">
            <div class="spinner-large"></div>
            <p>Loading goals...</p>
        </div>
    `;
}

function createErrorState(message) {
    return `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h2>Failed to load goals</h2>
            <p>${message || 'Something went wrong'}</p>
            <button onclick="window.location.reload()" class="btn-primary">
                Try Again
            </button>
        </div>
    `;
}


// ============================================
// FETCH AND RENDER - Issue #77
// ============================================

async function renderGoalsListPage() {
    const content = `
        <div class="page-header">
            <div>
                <h1>Goals</h1>
                <p class="page-subtitle">Track and manage your goals</p>
            </div>
            <button onclick="window.showAddGoalModal()" class="btn-primary">
                ➕ New Goal
            </button>
        </div>
        
        <div id="goalsContainer">
            ${createLoadingState()}
        </div>
    `;

    appContainer.innerHTML = createLayout(content, '/projects');
    attachNavigationListeners();

    // Fetch goals
    try {
        const goals = await goalsService.fetchGoals();

        // Update container with goals
        const goalsContainer = document.getElementById('goalsContainer');
        if (goalsContainer) {
            goalsContainer.innerHTML = createGoalsList(goals);
        }
    } catch (err) {
        const goalsContainer = document.getElementById('goalsContainer');
        if (goalsContainer) {
            goalsContainer.innerHTML = createErrorState(err.message);
        }
        Toast.error('Failed to load goals');
    }
}


// ============================================
// UPDATE PROJECTS PAGE
// ============================================

async function renderProjectsPageWithGoals() {
    const content = `
        <div class="projects-page">
            <div class="page-header">
                <div>
                    <h1 style="font-size: 32px; font-weight: 800; color: #101828;">Projects</h1>
                </div>
                <div class="header-actions">
                    <div class="theme-toggle">
                        <span class="sun active" style="background: #00BCD4; color: white;">☀️</span>
                        <span class="moon" style="color: #667085;">🌙</span>
                    </div>
                    <button onclick="window.showAddGoalModal()" class="btn-primary" style="padding: 10px 20px; border-radius: 12px; font-weight: 700;">
                        ➕ New Project
                    </button>
                </div>
            </div>
            
            <div class="search-container">
                <input type="text" id="projectSearchInput" placeholder="Search projects..." class="search-input" oninput="window.filterProjects()">
            </div>
            
            <div id="projectsContainer" class="goals-grid-container">
                ${createLoadingState()}
            </div>
        </div>
    `;

    appContainer.innerHTML = createLayout(content, '/projects');
    attachNavigationListeners();

    let allActiveGoals = [];

    // Helper for filtering
    window.filterProjects = () => {
        const query = document.getElementById('projectSearchInput').value.toLowerCase();
        const filtered = allActiveGoals.filter(g =>
            g.title.toLowerCase().includes(query) ||
            (g.description && g.description.toLowerCase().includes(query))
        );
        const projectsContainer = document.getElementById('projectsContainer');
        if (projectsContainer) {
            projectsContainer.innerHTML = createGoalsList(filtered);
        }
    };

    // Fetch goals (projects)
    try {
        const goals = await goalsService.fetchGoals();

        // Filter active goals
        allActiveGoals = goals.filter(g => g.status !== 'completed');

        const projectsContainer = document.getElementById('projectsContainer');
        if (projectsContainer) {
            projectsContainer.innerHTML = createGoalsList(allActiveGoals);
        }
    } catch (err) {
        const projectsContainer = document.getElementById('projectsContainer');
        if (projectsContainer) {
            projectsContainer.innerHTML = createErrorState(err.message);
        }
        if (window.Toast) window.Toast.error('Failed to load projects');
    }
}


// ============================================
// EXPORT
// ============================================

window.goalsService = goalsService;
window.renderGoalsListPage = renderGoalsListPage;
window.renderProjectsPageWithGoals = renderProjectsPageWithGoals;

// Override renderProjects to use new version
window.renderProjects = renderProjectsPageWithGoals;
