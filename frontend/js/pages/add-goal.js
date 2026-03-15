/**
 * Add Goal Page
 * Extracted from layout.js — includes color fix (color sent to API + stored in localStorage)
 */

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

function renderAddGoal() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = createLayout(renderAddGoalContent(), '/add-goal');
    attachNavigationListeners();
}

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
    const form      = event.target;
    const submitBtn = document.getElementById('addGoalSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    const freqType = document.querySelector('.freq-tab.active')?.dataset.type || 'repeating';
    const today        = new Date().toISOString().split('T')[0];
    const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const color = document.getElementById('goalColor').value || '#4CAF50';

    const goalData = {
        title:       form.title.value.trim(),
        type:        freqType === 'onetime' ? 'One Time' : 'Repeating',
        start_date:  freqType === 'onetime' ? (form.start_date?.value || today) : today,
        deadline:    freqType === 'onetime' ? (form.end_date?.value || oneYearLater) : oneYearLater,
        frequency:   freqType === 'onetime' ? 'daily' : (form.frequency.value || 'daily'),
        duration_min: Math.round((parseFloat(form.daily_target_hours.value) || 0) * 60),
        color,
    };

    try {
        const goal = await goalsService.createGoal(goalData);
        // Store color in localStorage keyed by ID and title for stats/sidebar lookup
        if (goal && goal.id) {
            const stored = JSON.parse(localStorage.getItem('goalColors') || '{}');
            stored[goal.id]    = color;
            stored[goal.title] = color;
            localStorage.setItem('goalColors', JSON.stringify(stored));
        }
        Toast.success('Goal created successfully!');
        router.navigate('/projects');
    } catch (err) {
        Toast.error(err.message || 'Failed to create goal');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Goal';
    }
};

window.renderAddGoal = renderAddGoal;
