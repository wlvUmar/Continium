/**
 * Profile Modal
 * Modal dialog for editing user profile
 */

function renderProfileModal() {
    const user      = authService.getUser();
    const userName  = user ? (user.full_name || user.fullName || 'User') : 'User';
    const userEmail = user ? (user.email || '') : '';
    const userBirth = user ? (user.birthdate || '') : '';
    const initial   = userName.charAt(0).toUpperCase();

    return `
        <div class="profile-modal-backdrop" onclick="closeProfileModal(event)">
            <div class="profile-modal" onclick="event.stopPropagation()">
                <div class="profile-modal-header">
                    <h2 class="profile-modal-title">Profile</h2>
                    <button class="profile-modal-close" onclick="closeProfileModal()" aria-label="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="profile-modal-content">
                    <div class="profile-avatar-section">
                        <div class="profile-avatar-large">${initial}</div>
                        <p class="profile-username">${userName}</p>
                        <p class="profile-user-email">${userEmail}</p>
                    </div>

                    <form class="profile-form" onsubmit="handleProfileSave(event)">
                        <div class="profile-section">
                            <p class="profile-section-title">Personal Information</p>

                            <div class="form-group">
                                <label class="form-label">Full Name</label>
                                <input type="text" name="full_name" class="form-input" value="${userName}" placeholder="Enter your full name">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" name="email" class="form-input" value="${userEmail}" placeholder="your@email.com">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Birthdate</label>
                                <input type="date" name="birthdate" class="form-input" value="${userBirth}">
                            </div>
                        </div>

                        <div class="profile-section">
                            <p class="profile-section-title">Change Password</p>

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
                        </div>

                        <div class="profile-modal-actions">
                            <button type="button" class="btn-secondary" onclick="closeProfileModal()">Cancel</button>
                            <button type="submit" class="btn-primary" id="profileSaveBtn">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function openProfileModal() {
    const modal = renderProfileModal();
    document.body.insertAdjacentHTML('beforeend', modal);
    document.body.style.overflow = 'hidden';
}

function closeProfileModal(event) {
    if (event && event.target.className !== 'profile-modal-backdrop') return;
    const backdrop = document.querySelector('.profile-modal-backdrop');
    if (backdrop) {
        backdrop.remove();
        document.body.style.overflow = '';
    }
}


window.handleProfileSave = async function(event) {
    event.preventDefault();
    const form    = event.target;
    const saveBtn = document.getElementById('profileSaveBtn');
    const currentPw = form.current_password.value;
    const newPw     = form.new_password.value;
    const confPw    = form.confirm_password.value;

    if (newPw && newPw !== confPw) { Toast.error('Passwords do not match'); return; }
    if (newPw && !currentPw) { Toast.error('Enter your current password to set a new one'); return; }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    try {
        const currentUser = authService.getUser() || {};
        const updated = {
            ...currentUser,
            full_name: form.full_name.value.trim(),
            email:     form.email.value.trim(),
            birthdate: form.birthdate.value,
        };
        localStorage.setItem('user', JSON.stringify(updated));

        if (newPw && currentPw) {
            await authService.changePassword(currentPw, newPw);
            form.current_password.value = '';
            form.new_password.value     = '';
            form.confirm_password.value = '';
        }

        Toast.success('Profile saved!');
        closeProfileModal();
    } catch (err) {
        const message = err.message || 'Failed to save profile';
        const backdrop = document.querySelector('.profile-modal-backdrop');
        if (backdrop) {
            Toast.error(message);
        }
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
};

window.renderProfileModal = renderProfileModal;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
