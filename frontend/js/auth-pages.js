/**
 * Authentication Pages - Updated based on Figma design
 * Issue #55 - All authentication screens
 */

// Store reference to app container
const appContainer = document.getElementById('app');

// ============================================
// LOGIN PAGE - Issue #69, #70
// ============================================
function renderLogin() {
    appContainer.innerHTML = `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h1 class="logo-text">Continium</h1>
                        <p class="auth-subtitle">Login</p>
                    </div>
                    
                    <form id="loginForm" class="auth-form">
                        <div class="form-group">
                            <label for="loginEmail">Email</label>
                            <div class="input-wrapper">
                                <img src="assets/icons/ic_baseline-email.svg" class="input-icon" alt="">
                                <input
                                    type="email"
                                    id="loginEmail"
                                    class="form-input with-icon"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <div class="input-wrapper">
                                <img src="assets/icons/mdi_password.svg" class="input-icon" alt="">
                                <input
                                    type="password"
                                    id="loginPassword"
                                    class="form-input with-icon with-toggle"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button type="button" class="password-toggle" onclick="togglePassword('loginPassword', this)">
                                    <img src="assets/icons/wpf_invisible.svg" alt="Show password">
                                </button>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn-primary btn-full">
                            Sign In
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <a href="#/forgot-password" class="link-text">Forgot your password?</a>
                    </div>
                    
                    <div class="auth-switch">
                        <span>Don't have an account? </span>
                        <a href="#/register" class="link-primary">Sign up</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Attach event listener
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Clear any previous errors
    ErrorMessage.clear(document.querySelector('.auth-card'));
    
    // Show loading
    Spinner.show('Logging in...');
    
    try {
        await authService.login(email, password);
        Toast.success('Welcome back!');
        router.navigate('/app');
    } catch (err) {
        const errorMsg = err.message || 'Login failed. Please check your credentials.';
        Toast.error(errorMsg);
        ErrorMessage.render(errorMsg, document.querySelector('.auth-form'));
    } finally {
        Spinner.hide();
    }
}


// ============================================
// REGISTER PAGE - Issue #69, #71
// ============================================
function renderRegister() {
    appContainer.innerHTML = `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h1 class="logo-text">Continium</h1>
                        <p class="auth-subtitle">Registration</p>
                    </div>
                    
                    <form id="registerForm" class="auth-form">
                        <div class="form-group">
                            <label for="registerName">Full Name</label>
                            <div class="input-wrapper">
                                <img src="assets/icons/mdi_user.svg" class="input-icon" alt="">
                                <input
                                    type="text"
                                    id="registerName"
                                    class="form-input with-icon"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="registerEmail">Email</label>
                            <div class="input-wrapper">
                                <img src="assets/icons/ic_baseline-email.svg" class="input-icon" alt="">
                                <input
                                    type="email"
                                    id="registerEmail"
                                    class="form-input with-icon"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="registerPassword">Password</label>
                            <div class="input-wrapper">
                                <img src="assets/icons/mdi_password.svg" class="input-icon" alt="">
                                <input
                                    type="password"
                                    id="registerPassword"
                                    class="form-input with-icon with-toggle"
                                    placeholder="Create a password"
                                    required
                                />
                                <button type="button" class="password-toggle" onclick="togglePassword('registerPassword', this)">
                                    <img src="assets/icons/wpf_invisible.svg" alt="Show password">
                                </button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="registerConfirmPassword">Confirm Password</label>
                            <div class="input-wrapper">
                                <img src="assets/icons/line-md_confirm.svg" class="input-icon" alt="">
                                <input
                                    type="password"
                                    id="registerConfirmPassword"
                                    class="form-input with-icon with-toggle"
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button type="button" class="password-toggle" onclick="togglePassword('registerConfirmPassword', this)">
                                    <img src="assets/icons/wpf_invisible.svg" alt="Show password">
                                </button>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn-primary btn-full">
                            Sign Up
                        </button>
                    </form>
                    
                    <div class="auth-switch">
                        <span>Already have an account? </span>
                        <a href="#/login" class="link-primary">Sign in</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Clear previous errors
    ErrorMessage.clear(document.querySelector('.auth-card'));
    
    // Validate passwords match
    if (password !== confirmPassword) {
        Toast.error('Passwords do not match');
        ErrorMessage.render('Passwords do not match', document.querySelector('.auth-form'));
        return;
    }
    
    // Validate password strength
    if (password.length < 6) {
        Toast.error('Password must be at least 6 characters');
        ErrorMessage.render('Password must be at least 6 characters', document.querySelector('.auth-form'));
        return;
    }
    
    Spinner.show('Creating account...');
    
    try {
        await authService.register(name, email, password);
        Toast.success('Account created! Please verify your email.');
        router.navigate('/verify');
    } catch (err) {
        const errorMsg = err.message || 'Registration failed. Please try again.';
        Toast.error(errorMsg);
        ErrorMessage.render(errorMsg, document.querySelector('.auth-form'));
    } finally {
        Spinner.hide();
    }
}


// ============================================
// HELPERS
// ============================================
function getHashParams() {
    const hash = window.location.hash; // e.g. "#/verify?token=abc"
    const queryPart = hash.includes('?') ? hash.substring(hash.indexOf('?') + 1) : '';
    return new URLSearchParams(queryPart);
}


// ============================================
// VERIFICATION PAGE - Issue #69, #72
// ============================================
function renderVerification() {
    const token = getHashParams().get('token');

    appContainer.innerHTML = `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card verification-card">
                    <div class="auth-header">
                        <h1 class="logo-text">Continium</h1>
                        <p class="auth-subtitle">Email Verification</p>
                    </div>
                    <div id="verificationContent" class="verification-content">
                        ${token ? `
                            <div class="verification-loading">
                                <div class="spinner-large"></div>
                                <p>Verifying your email...</p>
                            </div>
                        ` : `
                            <div class="verification-message">
                                <p>Please check your email for a verification link.</p>
                                <p class="text-muted">We've sent a verification email to your address.</p>
                                <a href="#/login" class="btn-primary">Back to Login</a>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;

    if (token) verifyEmail(token);
}

async function verifyEmail(token) {
    try {
        await authService.verifyEmail(token);
        document.getElementById('verificationContent').innerHTML = `
            <div class="verification-success">
                <div class="success-icon">✓</div>
                <h3>Email Verified!</h3>
                <p>Your account has been successfully verified.</p>
                <a href="#/login" class="btn-primary">Continue to Login</a>
            </div>
        `;
        Toast.success('Email verified successfully!');
    } catch (err) {
        document.getElementById('verificationContent').innerHTML = `
            <div class="verification-error">
                <div class="error-icon">✕</div>
                <h3>Verification Failed</h3>
                <p>${err.message || 'The verification link is invalid or has expired.'}</p>
                <a href="#/login" class="btn-primary">Back to Login</a>
            </div>
        `;
        Toast.error('Verification failed');
    }
}


// ============================================
// FORGOT PASSWORD PAGE - Issue #69, #72
// ============================================
function renderForgotPassword() {
    appContainer.innerHTML = `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h1 class="logo-text">Continium</h1>
                        <p class="auth-subtitle">Forgot Password</p>
                    </div>
                    
                    <p class="text-muted" style="margin-bottom: 20px;">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    
                    <form id="forgotPasswordForm" class="auth-form">
                        <div class="form-group">
                            <label for="forgotEmail">Email Address</label>
                            <div class="input-wrapper">
                                <img src="assets/icons/ic_baseline-email.svg" class="input-icon" alt="">
                                <input
                                    type="email"
                                    id="forgotEmail"
                                    class="form-input with-icon"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>
                        
                        <button type="submit" class="btn-primary btn-full">
                            Send Reset Link
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <a href="#/login" class="link-text">← Back to Login</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('forgotPasswordForm').addEventListener('submit', handleForgotPassword);
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    
    ErrorMessage.clear(document.querySelector('.auth-card'));
    Spinner.show('Sending reset link...');
    
    try {
        await authService.forgotPassword(email);
        
        Toast.success('Reset link sent! Check your email.');
        
        // Show success message
        document.querySelector('.auth-form').innerHTML = `
            <div class="success-message">
                <p>Password reset link has been sent to your email.</p>
                <p class="text-muted">Please check your inbox and follow the instructions.</p>
            </div>
        `;
    } catch (err) {
        const errorMsg = err.message || 'Failed to send reset link';
        Toast.error(errorMsg);
        ErrorMessage.render(errorMsg, document.querySelector('.auth-form'));
    } finally {
        Spinner.hide();
    }
}


// Toggle password visibility
window.togglePassword = function(inputId, btn) {    const input = document.getElementById(inputId);
    const img = btn.querySelector('img');
    if (input.type === 'password') {
        input.type = 'text';
        img.src = 'assets/icons/streamline-plump_invisible-2-remix.svg';
    } else {
        input.type = 'password';
        img.src = 'assets/icons/wpf_invisible.svg';
    }
};

// Export functions
window.renderLogin = renderLogin;
window.renderRegister = renderRegister;
window.renderVerification = renderVerification;
window.renderForgotPassword = renderForgotPassword;


// ============================================
// RESET PASSWORD PAGE
// ============================================
function renderResetPassword() {
    const token = getHashParams().get('token');

    if (!token) {
        appContainer.innerHTML = `
            <div class="auth-page">
                <div class="auth-container">
                    <div class="auth-card">
                        <div class="auth-header">
                            <h1 class="logo-text">Continium</h1>
                        </div>
                        <div class="verification-error">
                            <div class="error-icon">✕</div>
                            <h3>Invalid Link</h3>
                            <p>This password reset link is invalid or has expired.</p>
                            <a href="#/forgot-password" class="btn-primary">Request New Link</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    appContainer.innerHTML = `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h1 class="logo-text">Continium</h1>
                        <p class="auth-subtitle">Set New Password</p>
                    </div>

                    <form id="resetPasswordForm" class="auth-form">
                        <div class="form-group">
                            <label for="newPassword">New Password</label>
                            <div class="input-wrapper">
                                <img src="assets/icons/mdi_password.svg" class="input-icon" alt="">
                                <input type="password" id="newPassword" class="form-input with-icon with-toggle"
                                    placeholder="Enter new password" required />
                                <button type="button" class="password-toggle" onclick="togglePassword('newPassword', this)">
                                    <img src="assets/icons/wpf_invisible.svg" alt="Show password">
                                </button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="confirmNewPassword">Confirm Password</label>
                            <div class="input-wrapper">
                                <img src="assets/icons/line-md_confirm.svg" class="input-icon" alt="">
                                <input type="password" id="confirmNewPassword" class="form-input with-icon with-toggle"
                                    placeholder="Confirm new password" required />
                                <button type="button" class="password-toggle" onclick="togglePassword('confirmNewPassword', this)">
                                    <img src="assets/icons/wpf_invisible.svg" alt="Show password">
                                </button>
                            </div>
                        </div>

                        <button type="submit" class="btn-primary btn-full">Reset Password</button>
                    </form>

                    <div class="auth-footer">
                        <a href="#/login" class="link-text">← Back to Login</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('resetPasswordForm').addEventListener('submit', (e) => handleResetPassword(e, token));
}

async function handleResetPassword(e, token) {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;

    ErrorMessage.clear(document.querySelector('.auth-card'));

    if (newPassword !== confirmPassword) {
        Toast.error('Passwords do not match');
        ErrorMessage.render('Passwords do not match', document.querySelector('.auth-form'));
        return;
    }
    if (newPassword.length < 6) {
        Toast.error('Password must be at least 6 characters');
        ErrorMessage.render('Password must be at least 6 characters', document.querySelector('.auth-form'));
        return;
    }

    Spinner.show('Resetting password...');
    try {
        await authService.resetPassword(token, newPassword);
        Toast.success('Password reset successfully!');
        document.querySelector('.auth-card').innerHTML = `
            <div class="auth-header"><h1 class="logo-text">Continium</h1></div>
            <div class="verification-success">
                <div class="success-icon">✓</div>
                <h3>Password Reset!</h3>
                <p>Your password has been successfully updated.</p>
                <a href="#/login" class="btn-primary">Sign In</a>
            </div>
        `;
    } catch (err) {
        const msg = err.message || 'Reset failed. The link may have expired.';
        Toast.error(msg);
        ErrorMessage.render(msg, document.querySelector('.auth-form'));
    } finally {
        Spinner.hide();
    }
}

window.renderResetPassword = renderResetPassword;
