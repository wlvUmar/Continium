/**
 * Profile Modal
 * Modal dialog for editing user profile - 1:1 with Figma
 */

function renderProfileModal() {
    const user      = authService.getUser();
    const userName  = user ? (user.full_name || user.fullName || 'User') : 'User';
    const userEmail = user ? (user.email || '') : '';
    const initial   = userName.charAt(0).toUpperCase();
    const isDarkMode = document.documentElement.classList.contains('dark-mode') || document.body.classList.contains('dark-mode');

    return `
        <div class="profile-modal-backdrop" onclick="closeProfileModal(event)">
            <div class="profile-modal" onclick="event.stopPropagation()">
                <form class="profile-form" onsubmit="handleProfileSave(event)">
                    <!-- Header: Title + Save Button -->
                    <div class="profile-modal-header">
                        <h2 class="profile-modal-title">Profile</h2>
                        <button type="submit" class="btn-primary" id="profileSaveBtn">Save</button>
                    </div>

                    <div class="profile-modal-content">
                        <!-- User Header: Avatar + Name/Email -->
                        <div class="profile-user-header">
                            <div class="profile-avatar-large">${initial}</div>
                            <div class="profile-user-info">
                                <p class="profile-username">${userName}</p>
                                <p class="profile-user-email">${userEmail}</p>
                            </div>
                        </div>

                        <!-- User Information Section -->
                        <div class="profile-info-section">
                            <p class="profile-section-title">User information</p>

                            <div class="form-group">
                                <label class="form-label">Full Name</label>
                                <input type="text" name="full_name" class="form-input" value="${userName}" placeholder="Enter your full name">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" name="email" class="form-input" value="${userEmail}" placeholder="your@email.com">
                            </div>
                        </div>

                        <!-- Settings Section -->
                        <div class="profile-settings-section">

                            <div class="profile-setting-item">
                                <span class="profile-setting-label">Theme</span>
                                <div class="profile-toggle">
                                    <button type="button" class="profile-toggle-option ${!isDarkMode ? 'active' : ''}" onclick="handleThemeChange('light', event)"><img src="assets/icons/Light.svg" alt="Light"> Light mode</button>
                                    <button type="button" class="profile-toggle-option ${isDarkMode ? 'active' : ''}" onclick="handleThemeChange('dark', event)"><img src="assets/icons/Dark.svg" alt="Dark"> Dark mode</button>
                                </div>
                            </div>

                            <div class="profile-setting-item">
                                <span class="profile-setting-label">Notifications</span>
                                <div class="profile-toggle">
                                    <button type="button" class="profile-toggle-option active" onclick="handleNotifications('on', event)">
                                    <img src="assets/icons/basil_notification-on-solid.svg" >Notification on</button>
                                    <button type="button" class="profile-toggle-option" onclick="handleNotifications('off', event)">
                                    <img src="assets/icons/basil_notification-off-solid.svg" >Notification off</button>
                                </div>
                            </div>
                        </div>

                        <!-- Change Password Button -->
                        <button type="button" class="btn-change-password" onclick="handleChangePassword()">Change password</button>
                    </div>
                </form>
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

window.handleThemeChange = function(theme, event) {
    event.preventDefault();
    const buttons = event.target.parentElement.querySelectorAll('.profile-toggle-option');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
};

window.handleNotifications = function(status, event) {
    event.preventDefault();
    const buttons = event.target.parentElement.querySelectorAll('.profile-toggle-option');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    localStorage.setItem('notifications', status);
};

window.handleChangePassword = function() {
    Toast.info('Change password feature not yet implemented');
};

window.handleProfileSave = async function(event) {
    event.preventDefault();
    const form    = event.target;
    const saveBtn = document.getElementById('profileSaveBtn');

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    try {
        const currentUser = authService.getUser() || {};
        const updated = {
            ...currentUser,
            full_name: form.full_name.value.trim(),
            email:     form.email.value.trim(),
        };
        localStorage.setItem('user', JSON.stringify(updated));

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
        saveBtn.textContent = 'Save';
    }
};

window.renderProfileModal = renderProfileModal;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
