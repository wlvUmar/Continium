/**
 * Completed Goals Page Component
 * Handles fetching, filtering, and displaying completed goals
 */

function formatConciseTime(seconds) {
    if (!seconds) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

// Generate color based on index or ID to match the colorful design
const colors = ['#00BCD4', '#9C27B0', '#CDDC39', '#FF9800', '#E91E63', '#4CAF50'];

function createCompletedGoalCard(goal, index) {
    const color = colors[index % colors.length];
    const timeSpent = formatConciseTime(goal.timeSpent);
    const totalTime = formatConciseTime(goal.totalTime || goal.timeSpent);
    const score = goal.score || 10;
    const gid = goal.id || goal._id;

    return `
        <div class="completed-item" onclick="router.navigate('/goal/${gid}')">
            <div class="completed-icon" style="background: ${color};">✓</div>
            <div class="completed-info">
                <h4>${goal.title || 'Untitled Goal'}</h4>
                <div class="completed-meta">
                    <p>${timeSpent} / ${totalTime}</p>
                    <span class="completed-score">${score}</span>
                </div>
            </div>
            <div class="completed-actions" style="display: flex; gap: 8px; align-items: center;">
                <button class="btn-icon-mini" onclick="event.stopPropagation(); window.promptDeleteGoal('${gid}')" title="Delete" style="background: none; border: none; font-size: 18px; cursor: pointer;">🗑️</button>
                <div class="completed-check-btn" style="color: ${color};">✓</div>
            </div>
            <div class="completed-edge-bar" style="background: ${color};"></div>
        </div>
    `;
}

function createCompletedGoalsList(goals) {
    if (!goals || goals.length === 0) {
        return `
            <div class="completed-empty-container">
                <div class="prize-icon-container">
                    <img src="assets/icons/prize_cup.svg" alt="Trophy" class="prize-icon" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 24 24%22 fill=%22%23FFD700%22><path d=%22M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.45.52.99.97 1.61 1.35V17c0 1.1-.9 2-2 2v2h10v-2c-1.1 0-2-.9-2-2v-2.71c.62-.38 1.16-.83 1.61-1.35 2.47-.31 4.39-2.39 4.39-4.94V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z%22/></svg>'">
                </div>
                <h2>No completed goals yet</h2>
                <p>Keep working on your active goals to see them here!</p>
                <button onclick="router.navigate('/projects')" class="btn-primary">
                    View Active Projects
                </button>
            </div>
        `;
    }

    return `
        <div class="completed-list">
            ${goals.map((goal, index) => createCompletedGoalCard(goal, index)).join('')}
        </div>
    `;
}

async function renderCompletedGoalsPage() {
    // Initial loading layout
    const loadingContent = `
        <div class="page-header">
            <h1 style="font-size: 32px; font-weight: 800; color: #101828;">Completed</h1>
            <div class="header-actions">
                <!-- Theme toggle placeholder if needed -->
            </div>
        </div>
        
        <div class="search-container" style="margin-bottom: 24px;">
            <input type="text" id="completedSearchInput" placeholder="Search completed projects..." class="search-input">
        </div>
        
        <div class="completed-content">
            <div class="completed-filters">
                <button class="filter-btn active">All time</button>
                <button class="filter-btn">Past week</button>
                <button class="clear-all-btn" onclick="window.clearAllCompletedGoals()" style="background: #00BCD4; color: white; border: none; padding: 10px 24px; border-radius: 12px; font-weight: 700;">Clear all</button>
            </div>
            <div id="completedGoalsContainer" style="padding-top: 40px; text-align: center;">
                <div class="spinner-large" style="margin: 0 auto;"></div>
                <p>Loading completed goals...</p>
            </div>
        </div>
    `;

    appContainer.innerHTML = createLayout(loadingContent, '/completed');
    attachNavigationListeners();

    try {
        const goals = await window.goalsService.fetchGoals();

        // Filter: completed === true (from user prompt) or status === 'completed'
        const completedGoals = goals.filter(g => g.completed === true || g.status === 'completed');

        const container = document.getElementById('completedGoalsContainer');
        if (container) {
            container.style.paddingTop = '0';
            container.style.textAlign = 'left';
            container.innerHTML = createCompletedGoalsList(completedGoals);
        }

        // Hook up search filter
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim().toLowerCase();
                const filtered = completedGoals.filter(g =>
                    (g.title || '').toLowerCase().includes(query) ||
                    (g.description || '').toLowerCase().includes(query)
                );

                if (container) {
                    container.innerHTML = createCompletedGoalsList(filtered);
                }
            });
        }
    } catch (err) {
        console.error('Failed to load completed goals:', err);
        const container = document.getElementById('completedGoalsContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h2>Failed to load completed goals</h2>
                    <p>${err.message || 'Something went wrong'}</p>
                    <button onclick="renderCompletedGoalsPage()" class="btn-primary">Try Again</button>
                </div>
            `;
        }
        if (window.Toast) window.Toast.error('Failed to load completed goals');
    }
}

async function clearAllCompletedGoals() {
    if (!confirm('Are you sure you want to clear all completed goals? This cannot be undone.')) return;

    try {
        const goals = await window.goalsService.fetchGoals();
        const completedGoals = goals.filter(g => g.completed === true || g.status === 'completed');

        if (completedGoals.length === 0) {
            window.Toast.info('No goals to clear');
            return;
        }

        // Delete all concurrently
        await Promise.all(completedGoals.map(g => window.goalsService.deleteGoal(g.id || g._id)));

        if (window.Toast) window.Toast.success('Cleared all completed goals');
        renderCompletedGoalsPage();
    } catch (err) {
        console.error(err);
        if (window.Toast) window.Toast.error('Failed to clear some goals');
        renderCompletedGoalsPage();
    }
}

window.renderCompletedGoalsPage = renderCompletedGoalsPage;
window.clearAllCompletedGoals = clearAllCompletedGoals;
