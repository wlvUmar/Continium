/**
 * Goal CRUD UI
 * Handles Create, Update, Delete modals and logic
 */

function createModalOverlay() {
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modalOverlay';
        overlay.className = 'modal-overlay';
        overlay.onclick = (e) => {
            if (e.target === overlay) closeModal();
        };
        document.body.appendChild(overlay);
    }
    return overlay;
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
    }
}

function showAddGoalModal() {
    const overlay = createModalOverlay();

    const modalContent = `
        <div class="modal-card-figma">
            <div class="figma-modal-header">
                <h2>Add goal</h2>
                <button class="figma-close-btn" onclick="closeModal()">
                    <img src="assets/icons/close_icon.svg" alt="Close" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22><path d=%22M18 6 6 18M6 6l12 12%22/></svg>'">
                </button>
            </div>
            
            <form id="addGoalForm" onsubmit="submitAddGoal(event)">
                <div class="figma-form-group">
                    <label class="figma-label">Goal name</label>
                    <input type="text" id="goalTitle" required placeholder="Enter Your Goal" class="figma-input">
                </div>

                <div class="frequency-container">
                    <p class="figma-label">Frequency</p>
                    <div class="figma-segmented-control main-freq">
                        <button type="button" class="figma-segment-btn" id="freqRepeating" onclick="setFrequency('repeating')">
                            <span class="segment-icon">🔄</span> Repeating
                        </button>
                        <button type="button" class="figma-segment-btn active" id="freqOneTime" onclick="setFrequency('one-time')">
                            <span class="segment-icon">🏁</span> One time
                        </button>
                    </div>
                </div>

                <div id="dynamicFormContent" class="figma-card-inset">
                    <!-- One-time content by default -->
                    <div class="figma-form-row">
                        <div class="figma-form-group">
                            <label class="figma-label">Start Date</label>
                            <div class="figma-select-wrapper">
                                <select id="startDate" class="figma-select">
                                    <option>Today</option>
                                    <option>Tomorrow</option>
                                </select>
                            </div>
                        </div>
                        <div class="figma-form-group">
                            <label class="figma-label">Deadline</label>
                            <div class="figma-select-wrapper">
                                <select id="deadline" class="figma-select">
                                    <option>Feb 22</option>
                                    <option>Feb 23</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="figma-form-group">
                        <label class="figma-label">Duration</label>
                        <div class="figma-select-wrapper">
                            <select id="duration" class="figma-select">
                                <option>20h 00m</option>
                                <option>10h 00m</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="figma-modal-actions">
                    <button type="button" class="figma-btn-outline" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="figma-btn-cyan">Save</button>
                </div>
            </form>
        </div>
    `;

    overlay.innerHTML = modalContent;
    overlay.style.display = 'flex';
}

window.setFrequency = (type) => {
    const rep = document.getElementById('freqRepeating');
    const ot = document.getElementById('freqOneTime');
    const dynamicContent = document.getElementById('dynamicFormContent');

    if (type === 'repeating') {
        rep.classList.add('active');
        ot.classList.remove('active');
        dynamicContent.innerHTML = `
            <div class="secondary-freq-container" style="margin-bottom: 24px;">
                <div class="figma-segmented-control secondary-freq">
                    <button type="button" class="figma-segment-btn active" onclick="setSubFrequency(this, 'daily')">Daily</button>
                    <button type="button" class="figma-segment-btn" onclick="setSubFrequency(this, 'weekly')">Weekly</button>
                    <button type="button" class="figma-segment-btn" onclick="setSubFrequency(this, 'monthly')">Monthly</button>
                </div>
            </div>
            <div class="figma-form-group">
                <label class="figma-label">Duration</label>
                <div class="figma-select-wrapper">
                    <select id="duration" class="figma-select">
                        <option>2h 00m</option>
                        <option>4h 00m</option>
                    </select>
                </div>
            </div>
        `;
    } else {
        rep.classList.remove('active');
        ot.classList.add('active');
        dynamicContent.innerHTML = `
            <div class="figma-form-row">
                <div class="figma-form-group">
                    <label class="figma-label">Start Date</label>
                    <div class="figma-select-wrapper">
                        <select id="startDate" class="figma-select">
                            <option>Today</option>
                            <option>Tomorrow</option>
                        </select>
                    </div>
                </div>
                <div class="figma-form-group">
                    <label class="figma-label">Deadline</label>
                    <div class="figma-select-wrapper">
                        <select id="deadline" class="figma-select">
                            <option>Feb 22</option>
                            <option>Feb 23</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="figma-form-group">
                <label class="figma-label">Duration</label>
                <div class="figma-select-wrapper">
                    <select id="duration" class="figma-select">
                        <option>20h 00m</option>
                        <option>10h 00m</option>
                    </select>
                </div>
            </div>
        `;
    }
};

window.setSubFrequency = (btn, type) => {
    const btns = btn.parentElement.querySelectorAll('.figma-segment-btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

function showEditGoalModal(goalId, title, description) {
    const overlay = createModalOverlay();

    const modalContent = `
        <div class="modal-card-figma">
            <div class="figma-modal-header">
                <h2>Edit Goal</h2>
                <button class="figma-close-btn" onclick="closeModal()">
                    <img src="assets/icons/exit_vector.svg" alt="Close" style="width: 18px; height: 18px; filter: brightness(0) invert(1);">
                </button>
            </div>
            
            <form id="editGoalForm" onsubmit="submitEditGoal(event, '${goalId}')">
                <div class="figma-form-group">
                    <label class="figma-label">Goal name</label>
                    <input type="text" id="editGoalTitle" required value="${title.replace(/"/g, '&quot;')}" class="figma-input">
                </div>

                <div class="figma-form-group">
                    <label class="figma-label">Description (Optional)</label>
                    <textarea id="editGoalDescription" rows="4" class="figma-input" style="resize: none;">${description ? description.replace(/</g, "&lt;") : ''}</textarea>
                </div>

                <div class="figma-modal-actions">
                    <button type="button" class="figma-btn-outline" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="figma-btn-cyan">Save Changes</button>
                </div>
            </form>
        </div>
    `;

    overlay.innerHTML = modalContent;
    overlay.style.display = 'flex';
}

async function submitAddGoal(event) {
    event.preventDefault();

    const titleInput = document.getElementById('goalTitle');
    const descriptionInput = document.getElementById('goalDescription');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    const title = titleInput.value.trim();
    const description = descriptionInput ? descriptionInput.value.trim() : '';

    if (!title) {
        if (window.Toast) window.Toast.error('Title is required');
        titleInput.focus();
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
    }

    const data = {
        title,
        description,
        status: 'active',
        progress: 0,
        timeSpent: 0
    };

    try {
        await window.goalsService.createGoal(data);
        closeModal();
        if (window.Toast) window.Toast.success('Goal created successfully');

        // Refresh UI
        if (router.currentRoute === '/projects') {
            window.renderProjectsPageWithGoals();
        } else {
            router.navigate('/projects');
        }
    } catch (err) {
        console.error(err);
        if (window.Toast) window.Toast.error('Failed to create goal');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Goal';
        }
    }
}

async function submitEditGoal(event, goalId) {
    event.preventDefault();

    const titleInput = document.getElementById('editGoalTitle');
    const descriptionInput = document.getElementById('editGoalDescription');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    const title = titleInput.value.trim();
    const description = descriptionInput ? descriptionInput.value.trim() : '';

    if (!title) {
        if (window.Toast) window.Toast.error('Title is required');
        titleInput.focus();
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
    }

    const data = {
        title,
        description
    };

    try {
        await window.goalsService.updateGoal(goalId, data);
        closeModal();
        if (window.Toast) window.Toast.success('Goal updated');

        // Refresh UI
        if (router.currentRoute === '/projects') {
            window.renderProjectsPageWithGoals();
        } else if (router.currentRoute.startsWith('/goal/')) {
            window.renderGoalDetail(goalId);
        }
    } catch (err) {
        console.error(err);
        if (window.Toast) window.Toast.error('Failed to update goal');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
        }
    }
}

function promptDeleteGoal(goalId) {
    const overlay = createModalOverlay();

    const modalContent = `
        <div class="modal-card-delete">
            <div class="delete-icon-large">🗑️</div>
            <h2>Delete Goal?</h2>
            <p>Are you sure you want to delete this goal? This action cannot be undone and all progress will be lost.</p>
            <div class="delete-modal-actions">
                <button class="btn-delete-cancel" onclick="closeModal()">Cancel</button>
                <button class="btn-delete-confirm" onclick="confirmDeleteGoal('${goalId}')">Delete</button>
            </div>
        </div>
    `;

    overlay.innerHTML = modalContent;
    overlay.style.display = 'flex';
}

async function confirmDeleteGoal(goalId) {
    const deleteBtn = document.querySelector('.btn-delete-confirm');
    if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.textContent = 'Deleting...';
    }

    try {
        await window.goalsService.deleteGoal(goalId);
        closeModal();
        if (window.Toast) window.Toast.success('Goal deleted');

        // Robust Refresh UI - check both route and container existence
        if (router.currentRoute === '/projects' || document.getElementById('projectsContainer')) {
            if (typeof window.renderProjectsPageWithGoals === 'function') {
                window.renderProjectsPageWithGoals();
            }
        }

        if (router.currentRoute === '/completed' || document.getElementById('completedGoalsContainer')) {
            if (typeof window.renderCompletedGoalsPage === 'function') {
                window.renderCompletedGoalsPage();
            }
        }

        if (router.currentRoute.startsWith('/goal/')) {
            router.navigate('/projects');
        }
    } catch (err) {
        console.error(err);
        if (window.Toast) window.Toast.error('Failed to delete goal');
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'Delete';
        }
    }
}

async function markGoalAsCompleted(goalId) {
    if (!confirm('Mark this goal as completed?')) return;

    try {
        await window.goalsService.updateGoal(goalId, { status: 'completed', completed: true });
        if (window.Toast) window.Toast.success('Goal completed! Great job!');

        // Refresh UI
        if (router.currentRoute === '/projects') {
            window.renderProjectsPageWithGoals();
        } else if (router.currentRoute.startsWith('/goal/')) {
            router.navigate('/completed');
        }
    } catch (err) {
        console.error(err);
        if (window.Toast) window.Toast.error('Failed to complete goal');
    }
}

window.showAddGoalModal = showAddGoalModal;
window.showEditGoalModal = showEditGoalModal;
window.submitAddGoal = submitAddGoal;
window.submitEditGoal = submitEditGoal;
window.promptDeleteGoal = promptDeleteGoal;
window.confirmDeleteGoal = confirmDeleteGoal;
window.markGoalAsCompleted = markGoalAsCompleted;
window.closeModal = closeModal;
