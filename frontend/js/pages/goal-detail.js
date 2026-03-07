/**
 * Goal / Project Detail Page + Timer
 * Extracted from layout.js
 */

let _timerInterval = null;
let _timerRunning  = false;
let _timerElapsed  = 0;
let _timerGoalSeconds = 9000; // 2h 30m default
const TIMER_CIRCUMFERENCE = 565.49; // 2 * PI * 90

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
                    <span class="stat-large">0h 00m</span>
                    <span style="font-size:13px;color:#999;">Total</span>
                </div>
                <div class="stats-summary-item">
                    <span class="stat-large">0h 00m</span>
                    <span style="font-size:13px;color:#999;">Average</span>
                </div>
            </div>
        </div>
    `;
}

function renderProjectDetail(projectId) {
    const appContainer = document.getElementById('app');
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
    _timerRunning = false;
    _timerElapsed = 0;
    appContainer.innerHTML = createLayout(renderProjectDetailContent(projectId), `/project/${projectId}`);
    attachNavigationListeners();
}

function renderGoal(goalId) {
    renderProjectDetail(goalId);
}

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

window.timerToggle = function() {
    const icon = document.getElementById('playPauseIcon');
    if (_timerRunning) {
        clearInterval(_timerInterval);
        _timerRunning = false;
        if (icon) { icon.src = 'assets/icons/play_vector.svg'; icon.alt = 'Play'; }
    } else {
        _timerRunning = true;
        if (icon) { icon.src = 'assets/icons/Pause.svg'; icon.alt = 'Pause'; }
        _timerInterval = setInterval(() => { _timerElapsed++; _updateTimerDisplay(); }, 1000);
    }
};

window.timerReset = function() {
    clearInterval(_timerInterval);
    _timerRunning = false;
    _timerElapsed = 0;
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

window.renderProjectDetail = renderProjectDetail;
window.renderGoal = renderGoal;
