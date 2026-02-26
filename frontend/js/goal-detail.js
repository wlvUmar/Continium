/**
 * Goal Detail & Timer Dashboard
 * Handles timer logic and goal stats display
 */

let currentTimerInterval = null;
let currentSeconds = 0;
let isPlaying = false;
let currentGoalId = null;

// Helper to format HH:MM:SS
function formatTimerDisplay(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// Helper to format concise time string (e.g. 1h 20m)
function formatConciseTime(totalSeconds) {
    if (!totalSeconds) return '0h 0m';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

function startTimer() {
    if (isPlaying) return;
    isPlaying = true;

    const playBtn = document.getElementById('timerPlayBtn');
    const stopBtn = document.getElementById('timerStopBtn');

    if (playBtn) {
        playBtn.disabled = true; // Prevent rapid clicking
        playBtn.style.display = 'none';
    }
    if (stopBtn) {
        stopBtn.disabled = false;
        stopBtn.style.display = 'inline-flex';
    }

    if (currentTimerInterval) {
        clearInterval(currentTimerInterval);
    }

    currentTimerInterval = setInterval(() => {
        currentSeconds++;
        updateTimerDisplay();
    }, 1000);
}

async function stopTimer() {
    if (!isPlaying) return;
    isPlaying = false;

    const playBtn = document.getElementById('timerPlayBtn');
    const stopBtn = document.getElementById('timerStopBtn');

    if (stopBtn) {
        stopBtn.disabled = true; // Prevent rapid clicking
    }

    if (currentTimerInterval) {
        clearInterval(currentTimerInterval);
        currentTimerInterval = null;
    }

    if (playBtn) {
        playBtn.disabled = false;
        playBtn.style.display = 'inline-flex';
    }
    if (stopBtn) {
        stopBtn.style.display = 'none';
    }

    // Save updated time to backend
    try {
        await window.goalsService.updateGoal(currentGoalId, { timeSpent: currentSeconds });
        if (window.Toast) window.Toast.success('Progress saved');
    } catch (err) {
        console.error('Failed to save progress', err);
        if (window.Toast) window.Toast.error('Failed to save progress');
    }
}

function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    if (display) {
        display.textContent = formatTimerDisplay(currentSeconds).split(':').slice(1).join(' : ');
    }
    updateTimerArc();
}

function updateTimerArc() {
    const circle = document.getElementById('timerProgressCircle');
    const dot = document.getElementById('timerIndicatorDot');
    if (!circle) return;

    // Default target 2 hours (can be customized)
    const targetSeconds = 3600 * 2;
    const progress = Math.min(1, currentSeconds / targetSeconds);

    // Circumference = 2 * PI * R (R=160) ≈ 1005
    const circumference = 1005;
    const offset = circumference - (progress * circumference);

    circle.style.strokeDashoffset = offset;

    // Update dot position
    if (dot) {
        const angle = (progress * 360) - 90; // -90 to start at top
        const radius = 160;
        const x = 180 + radius * Math.cos(angle * Math.PI / 180);
        const y = 180 + radius * Math.sin(angle * Math.PI / 180);

        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
    }
}

window.startTimer = startTimer;
window.stopTimer = stopTimer;

window.setTimerTab = (btn, tab) => {
    const tabs = btn.parentElement.querySelectorAll('.timer-tab');
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const statContainer = document.getElementById('statContainer');
    if (!statContainer) return;

    if (tab === 'today') {
        renderTodayStats(statContainer);
    } else {
        renderTotalStats(statContainer);
    }
};

function renderTodayStats(container) {
    // Mock data or real data if available
    container.innerHTML = `
        <p class="timer-top-progress-text">${formatConciseTime(currentSeconds)} / ${formatConciseTime(3600 * 2)}</p>
        <div class="timer-top-progress-bar">
            <div class="timer-top-progress-fill" style="width: ${Math.min(100, (currentSeconds / (3600 * 2)) * 100).toFixed(1)}%;"></div>
        </div>
    `;
}

async function renderTotalStats(container) {
    try {
        const goal = await window.goalsService.fetchGoal(currentGoalId);
        container.innerHTML = `
            <p class="timer-top-progress-text">${formatConciseTime(currentSeconds)} / ${formatConciseTime(goal.totalTime || 3600 * 20)}</p>
            <div class="timer-top-progress-bar">
                <div class="timer-top-progress-fill" style="width: ${Math.min(100, (currentSeconds / (goal.totalTime || 3600 * 20)) * 100).toFixed(1)}%;"></div>
            </div>
        `;
    } catch (err) {
        console.error('Failed to fetch total stats', err);
    }
}

async function renderGoalDetail(goalId) {
    currentGoalId = goalId;
    isPlaying = false;
    if (currentTimerInterval) {
        clearInterval(currentTimerInterval);
        currentTimerInterval = null;
    }

    // Render loading state
    const loadingContent = `
        <div class="page-header">
            <button class="btn-primary btn-back" onclick="router.navigate('/projects')">← Back to Projects</button>
            <h1>Loading Goal...</h1>
        </div>
        <div class="loading-state">
            <div class="spinner-large"></div>
        </div>
    `;
    appContainer.innerHTML = createLayout(loadingContent, `/project/${goalId}`);
    attachNavigationListeners();

    try {
        const goal = await window.goalsService.fetchGoal(goalId);
        currentSeconds = goal.timeSpent || 0;

        const content = `
            <div class="timer-dashboard-fullscreen">
                <div class="timer-top-controls">
                    <button class="edit-goal-btn" onclick="window.showEditGoalModal('${goalId}', '${(goal.title || '').replace(/'/g, "\\'")}', '${(goal.description || '').replace(/'/g, "\\'")}')" title="Edit Goal" style="margin-right: 12px; background: #344054; border: none; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; font-size: 20px;">
                        ✏️
                    </button>
                    <button class="complete-goal-btn" onclick="window.markGoalAsCompleted('${goalId}')" title="Mark as Completed" style="margin-right: 12px; background: #4CAF50; border: none; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; font-size: 20px;">
                        ✓
                    </button>
                    <button class="fullscreen-btn" title="Toggle Fullscreen">
                        <img src="assets/icons/Bigger_vector.svg" alt="Full" style="width: 20px; height: 20px; filter: brightness(0) invert(1);">
                    </button>
                    <button class="close-btn" onclick="router.navigate('/projects')" title="Close">
                        <img src="assets/icons/exit_vector.svg" alt="Close" style="width: 18px; height: 18px; filter: brightness(0) invert(1);">
                    </button>
                </div>

                <div class="timer-project-info">
                    <h1 class="timer-project-title">${goal.title || 'Untitled Project'}</h1>
                    
                    <div class="timer-tabs">
                        <button class="timer-tab active" onclick="setTimerTab(this, 'today')">Today</button>
                        <button class="timer-tab" onclick="setTimerTab(this, 'total')">Total</button>
                    </div>

                    <div id="statContainer" class="timer-top-progress-container">
                        <p class="timer-top-progress-text">${formatConciseTime(currentSeconds)} / ${formatConciseTime(goal.totalTime || 3600 * 20)}</p>
                        <div class="timer-top-progress-bar">
                            <div class="timer-top-progress-fill" style="width: ${((currentSeconds / (goal.totalTime || 3600 * 20)) * 100).toFixed(1)}%;"></div>
                        </div>
                    </div>
                </div>

                <div class="timer-main-visual">
                    <div class="timer-arc-container">
                        <svg width="360" height="360" viewBox="0 0 360 360" class="timer-svg">
                            <!-- Background Track -->
                            <circle cx="180" cy="180" r="160" stroke="#E8EDF2" stroke-width="25" fill="none" />
                            <!-- Progress Arc -->
                            <circle id="timerProgressCircle" cx="180" cy="180" r="160" stroke="#00BCD4" stroke-width="25" fill="none" 
                                stroke-dasharray="1005" stroke-dashoffset="1005" stroke-linecap="round" 
                                transform="rotate(-90 180 180)" />
                        </svg>
                        
                        <div class="timer-center-info">
                            <p class="timer-focus-label">F O C U S</p>
                            <h2 id="timerDisplay" class="timer-time-main">${formatTimerDisplay(currentSeconds).split(':').slice(1).join(' : ')}</h2>
                            <div class="session-badge">1</div>
                        </div>
                        <div id="timerIndicatorDot" class="timer-indicator-dot-svg"></div>
                    </div>
                </div>

                <div class="timer-bottom-stats">
                    <div class="time-range-tabs">
                        <button class="range-tab active">Week</button>
                        <button class="range-tab">Month</button>
                        <button class="range-tab">3 Months</button>
                    </div>
                    
                    <div class="stats-row">
                        <div class="stat-item">
                            <span class="stat-label">Total</span>
                            <span class="stat-value">13h 20m</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Average</span>
                            <span class="stat-value">1h 54m</span>
                        </div>
                    </div>

                    <div class="mini-chart">
                        <div class="chart-bars">
                            <div class="chart-bar" style="height: 40%"></div>
                            <div class="chart-bar" style="height: 60%"></div>
                            <div class="chart-bar" style="height: 30%"></div>
                            <div class="chart-bar active" style="height: 80%"></div>
                            <div class="chart-bar" style="height: 50%"></div>
                            <div class="chart-bar" style="height: 70%"></div>
                            <div class="chart-bar" style="height: 40%"></div>
                        </div>
                        <div class="chart-labels">
                            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                        </div>
                    </div>
                </div>

                <div class="timer-action-controls">
                    <div class="pulsing-button-container">
                        <button id="timerPlayBtn" class="timer-pulse-btn play" onclick="startTimer()">
                            <img src="assets/icons/play_vector.svg" alt="Play" style="width: 32px; height: 32px; filter: brightness(0) invert(1);">
                        </button>
                        <button id="timerStopBtn" class="timer-pulse-btn stop" onclick="stopTimer()" style="display: none;">
                            <img src="assets/icons/Pause.svg" alt="Pause" style="width: 32px; height: 32px; filter: brightness(0) invert(1);">
                        </button>
                    </div>
                </div>
            </div>
        `;

        appContainer.innerHTML = createLayout(content, `/project/${goalId}`);
        attachNavigationListeners();

        // Initialize visual arc
        setTimeout(() => {
            if (typeof updateTimerArc === 'function') updateTimerArc();
        }, 50);

    } catch (err) {
        console.error(err);
        const errorContent = `
            <div class="page-header">
                <button class="btn-primary btn-back" onclick="router.navigate('/projects')">← Back</button>
                <h1>Error</h1>
            </div>
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h2>Failed to load goal</h2>
                <p>${err.message}</p>
            </div>
        `;
        appContainer.innerHTML = createLayout(errorContent, `/project/${goalId}`);
        attachNavigationListeners();
        if (window.Toast) window.Toast.error('Failed to load goal details');
    }
}

window.renderGoalDetail = renderGoalDetail;
