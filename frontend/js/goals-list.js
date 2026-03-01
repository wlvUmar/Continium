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
    const status = goal.status || 'active';
    
    return `
        <div class="goal-card" onclick="router.navigate('/goal/${goal.id}')">
            <div class="goal-header">
                <h3 class="goal-title">${goal.title || 'Untitled Goal'}</h3>
                <span class="goal-status status-${status}">${status}</span>
            </div>
            
            <p class="goal-description">${goal.description || 'No description'}</p>
            
            <div class="goal-progress">
                <div class="progress-info">
                    <span>Progress</span>
                    <span class="progress-percentage">${progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
            
            <div class="goal-meta">
                ${goal.deadline ? `
                    <div class="goal-deadline">
                        <img src="assets/icons/material-symbols-light_flag.svg" class="meta-icon-img" alt="Deadline">
                        <span>${new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                ` : ''}
                ${goal.frequency ? `
                    <div class="goal-time">
                        <img src="assets/icons/material-symbols-light_repeat-rounded.svg" class="meta-icon-img" alt="Frequency">
                        <span>${goal.frequency}</span>
                    </div>
                ` : goal.timeSpent ? `
                    <div class="goal-time">
                        <img src="assets/icons/material-symbols-light_repeat-rounded.svg" class="meta-icon-img" alt="Time">
                        <span>${formatTime(goal.timeSpent)}</span>
                    </div>
                ` : ''}
            </div>

            <div class="goal-card-actions">
                <button class="goal-edit-btn" onclick="event.stopPropagation()" title="Edit goal">
                    <img src="assets/icons/line-md_pencil.svg" alt="Edit">
                    Edit
                </button>
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
                <button onclick="router.navigate('/add-goal')" class="btn-primary">
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
            <button onclick="router.navigate('/add-goal')" class="btn-primary">
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
        <div class="page-header">
            <div>
                <h1>Projects</h1>
                <p class="page-subtitle">All your active projects</p>
            </div>
            <button onclick="router.navigate('/add-goal')" class="btn-primary">
                ➕ New Project
            </button>
        </div>
        
        <div id="projectsContainer">
            ${createLoadingState()}
        </div>
    `;
    
    appContainer.innerHTML = createLayout(content, '/projects');
    attachNavigationListeners();
    
    // Fetch goals (projects)
    try {
        const goals = await goalsService.fetchGoals();
        
        // Filter active goals
        const activeGoals = goals.filter(g => g.status !== 'completed');
        
        const projectsContainer = document.getElementById('projectsContainer');
        if (projectsContainer) {
            projectsContainer.innerHTML = createGoalsList(activeGoals);
        }
    } catch (err) {
        const projectsContainer = document.getElementById('projectsContainer');
        if (projectsContainer) {
            projectsContainer.innerHTML = createErrorState(err.message);
        }
        Toast.error('Failed to load projects');
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
