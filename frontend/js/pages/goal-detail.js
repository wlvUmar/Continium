/**
 * Goal / Project Detail Page + Timer
 */

let _timerInterval    = null;
let _timerRunning     = false;
let _timerElapsed     = 0;
let _timerGoalSeconds = 9000; // updated from goal.duration_min on load
let _currentGoalId    = null;
let _activeGoals      = [];   // for "next goal" navigation
const TIMER_CIRCUMFERENCE = 565.49; // 2 * PI * 90

// ============================================
// HELPERS
// ============================================

function _fmtMinutes(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${String(m).padStart(2, '0')}m`;
}

function _getCurrentPeriod() {
    const btn = document.querySelector('.period-tab.active');
    if (!btn) return 'week';
    const txt = btn.textContent.trim().toLowerCase();
    if (txt === '3 months') return '3months';
    return txt; // 'week' or 'month'
}

// Save elapsed seconds to backend as a stat entry
async function _saveSession() {
    if (!_currentGoalId || _timerElapsed < 60) return; // skip sessions under 1 min
    const minutes = Math.round(_timerElapsed / 60);
    try {
        await api.post(`/stats/goal/${_currentGoalId}`, { duration_minutes: minutes });
        _loadGoalStats(_currentGoalId, _getCurrentPeriod());
    } catch (err) {
        Toast.error('Failed to save session');
    }
}

// Load stats for a goal and period, update the summary cards
async function _loadGoalStats(goalId, period) {
    const totalEl = document.getElementById('statTotal');
    const avgEl   = document.getElementById('statAverage');
    if (!totalEl || !avgEl) return;

    try {
        const today = new Date();
        const start = new Date(today);
        if (period === 'month') {
            start.setMonth(today.getMonth() - 1);
        } else if (period === '3months') {
            start.setMonth(today.getMonth() - 3);
        } else { // week (default)
            start.setDate(today.getDate() - 7);
        }

        const fmt   = d => d.toISOString().split('T')[0];
        const stats = await api.get(`/stats/${goalId}/by-date-range?start_date=${fmt(start)}&end_date=${fmt(today)}`);

        const totalMin = stats.reduce((sum, s) => sum + s.duration_minutes, 0);
        const days     = stats.length;
        const avgMin   = days > 0 ? Math.round(totalMin / days) : 0;

        totalEl.textContent = _fmtMinutes(totalMin);
        avgEl.textContent   = _fmtMinutes(avgMin);
    } catch (_) {
        // silently fail — stats panel stays at defaults
    }
}

// ============================================
// CONTENT TEMPLATE
// ============================================

function renderProjectDetailContent(goal) {
    const durationMin  = goal.duration_min || 150;
    const h            = Math.floor(durationMin / 60);
    const m            = durationMin % 60;
    const dailyLabel   = `Daily goal: ${h}h ${String(m).padStart(2, '0')}m`;

    return `
        <div class="page-header">
            <h1>${goal.title || 'Untitled'}</h1>
        </div>

        <div class="project-detail-wrapper">
            <div class="project-main-tabs">
                <button class="project-main-tab active" onclick="switchProjectTab('today', this)">Today</button>
                <button class="project-main-tab" onclick="switchProjectTab('total', this)">Total</button>
            </div>

            <div class="timer-ring-container">
                <svg class="timer-ring-svg" width="220" height="220" viewBox="0 0 220 220">
                    <circle cx="110" cy="110" r="104" fill="none" stroke="#E8E8E8" stroke-width="4"/>
                    <circle cx="110" cy="110" r="90"  fill="none" stroke="#F0F0F0" stroke-width="14"/>
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

            <div class="timer-goal-label" id="timerGoalLabel">${dailyLabel}</div>

            <div class="timer-controls">
                <button class="timer-btn" title="Reset" onclick="timerReset()">
                    <img src="assets/icons/reset_vector.svg" alt="Reset">
                </button>
                <button class="timer-btn timer-btn-primary" title="Play/Pause" onclick="timerToggle()">
                    <img src="assets/icons/play_vector.svg" alt="Play" id="playPauseIcon">
                </button>
                <button class="timer-btn" title="Next goal" onclick="timerNext()">
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
                    <span class="stat-large" id="statTotal">0h 00m</span>
                    <span style="font-size:13px;color:#999;">Total</span>
                </div>
                <div class="stats-summary-item">
                    <span class="stat-large" id="statAverage">0h 00m</span>
                    <span style="font-size:13px;color:#999;">Average</span>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// PAGE RENDER (async — fetches real goal data)
// ============================================

async function renderProjectDetail(projectId) {
    _currentGoalId = parseInt(projectId);
    const appContainer = document.getElementById('app');

    // Stop any running timer
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
    _timerRunning = false;
    _timerElapsed = 0;

    // Temporary loading state
    appContainer.innerHTML = `<div style="padding:60px;text-align:center;color:#999;">Loading...</div>`;

    // Fetch goal data + active goals list in parallel
    let goal = { id: projectId, title: `Project ${projectId}`, duration_min: 150 };
    try {
        const [fetchedGoal, allGoals] = await Promise.all([
            goalsService.fetchGoal(projectId),
            goalsService.fetchGoals()
        ]);
        goal          = fetchedGoal;
        _timerGoalSeconds = (goal.duration_min || 150) * 60;
        _activeGoals  = allGoals.filter(g => !g.is_complete && g.status !== 'completed');
    } catch (_) {
        _activeGoals = [];
    }

    appContainer.innerHTML = createLayout(renderProjectDetailContent(goal), `/project/${projectId}`);
    attachNavigationListeners();
    _updateTimerDisplay();

    // Load initial stats (week)
    _loadGoalStats(projectId, 'week');
}

function renderGoal(goalId) {
    renderProjectDetail(goalId);
}

// ============================================
// TIMER DISPLAY
// ============================================

function _updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    const arc     = document.getElementById('timerProgressArc');
    if (!display || !arc) return;
    const h = Math.floor(_timerElapsed / 3600);
    const m = Math.floor((_timerElapsed % 3600) / 60);
    const s = _timerElapsed % 60;
    display.textContent = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    arc.style.strokeDashoffset = TIMER_CIRCUMFERENCE * (1 - Math.min(_timerElapsed / _timerGoalSeconds, 1));
}

// ============================================
// TIMER CONTROLS
// ============================================

window.timerToggle = function() {
    const icon = document.getElementById('playPauseIcon');
    if (_timerRunning) {
        clearInterval(_timerInterval);
        _timerRunning = false;
        if (icon) { icon.src = 'assets/icons/play_vector.svg'; icon.alt = 'Play'; }
        // Save session to backend when paused
        _saveSession();
    } else {
        _timerRunning = true;
        if (icon) { icon.src = 'assets/icons/Pause.svg'; icon.alt = 'Pause'; }
        _timerInterval = setInterval(() => { _timerElapsed++; _updateTimerDisplay(); }, 1000);
    }
};

window.timerReset = function() {
    clearInterval(_timerInterval);
    _timerRunning = false;
    const icon = document.getElementById('playPauseIcon');
    if (icon) { icon.src = 'assets/icons/play_vector.svg'; icon.alt = 'Play'; }
    // Save what was elapsed, then reset display
    const elapsed = _timerElapsed;
    _timerElapsed = 0;
    _updateTimerDisplay();
    if (elapsed >= 60 && _currentGoalId) {
        api.post(`/stats/goal/${_currentGoalId}`, { duration_minutes: Math.round(elapsed / 60) })
            .then(() => _loadGoalStats(_currentGoalId, _getCurrentPeriod()))
            .catch(() => Toast.error('Failed to save session'));
    }
};

window.timerNext = async function() {
    // Stop timer and save the current session
    clearInterval(_timerInterval);
    _timerRunning = false;
    const icon = document.getElementById('playPauseIcon');
    if (icon) { icon.src = 'assets/icons/play_vector.svg'; icon.alt = 'Play'; }
    await _saveSession();

    // Navigate to the next active goal
    if (_activeGoals.length < 2) return; // no other goal to switch to
    const idx      = _activeGoals.findIndex(g => g.id === _currentGoalId);
    const nextGoal = _activeGoals[(idx + 1) % _activeGoals.length];
    if (nextGoal) {
        router.navigate(`/project/${nextGoal.id}`);
    }
};

// ============================================
// TAB HANDLERS
// ============================================

window.switchProjectTab = function(tab, btn) {
    document.querySelectorAll('.project-main-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
};

window.switchPeriodTab = function(period, btn) {
    document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    if (_currentGoalId) _loadGoalStats(_currentGoalId, period);
};

// ============================================
// EXPORTS
// ============================================

window.renderProjectDetail = renderProjectDetail;
window.renderGoal          = renderGoal;
