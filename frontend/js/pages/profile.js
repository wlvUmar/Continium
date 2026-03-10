/**
 * Profile Page
 * Extracted from layout.js
 */

function renderProfileContent() {
    const user      = authService.getUser();
    const userName  = user ? (user.full_name || user.fullName || 'User') : 'User';
    const userEmail = user ? (user.email || '') : '';
    const userBirth = user ? (user.birthdate || '') : '';
    const initial   = userName.charAt(0).toUpperCase();

    return `
        <div class="page-header">
            <h1>Profile</h1>
        </div>

        <div class="profile-content">
            <div class="profile-avatar-section">
                <div class="profile-avatar-large">${initial}</div>
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
                    <input type="date" name="birthdate" class="form-input" value="${userBirth}">
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
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = createLayout(renderProfileContent(), '/profile');
    attachNavigationListeners();
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
        // Save profile info to localStorage
        const currentUser = authService.getUser() || {};
        const updated = {
            ...currentUser,
            full_name: form.full_name.value.trim(),
            email:     form.email.value.trim(),
            birthdate: form.birthdate.value,
        };
        localStorage.setItem('user', JSON.stringify(updated));

        // Change password if fields are filled
        if (newPw && currentPw) {
            await authService.changePassword(currentPw, newPw);
            form.current_password.value = '';
            form.new_password.value     = '';
            form.confirm_password.value = '';
        }

        Toast.success('Profile saved!');
    } catch (err) {
        Toast.error(err.message || 'Failed to save profile');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
};

window.renderProfile = renderProfile;
