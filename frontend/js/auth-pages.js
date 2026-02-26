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
                            <div class="input-icon-wrapper">
                                <span class="input-icon-left">✉</span>
                                <input 
                                    type="email" 
                                    id="loginEmail" 
                                    class="form-input"
                                    placeholder="Email"
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="input-icon-wrapper">
                                <span class="input-icon-left">🔒</span>
                                <input 
                                    type="password" 
                                    id="loginPassword" 
                                    class="form-input"
                                    placeholder="Password"
                                    required 
                                />
                                <button type="button" class="input-icon-right" onclick="togglePassword('loginPassword', this)" aria-label="Toggle password">👁‍🗨</button>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn-primary btn-full">
                            Sign-in
                        </button>
                    </form>

                    <div class="auth-divider">
                        <span>Don't you have an account?</span>
                    </div>
                    <div class="auth-divider" style="margin-top:-4px;justify-content:center;">
                        <span class="divider-arrow">▼</span>
                    </div>
                    
                    <a href="#/register" class="btn-outlined" style="margin-top:8px;">Sign-up</a>
                    
                    <div class="auth-footer">
                        <a href="#/forgot-password" class="link-text">Forget your password?</a>
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
                            <div class="input-icon-wrapper">
                                <span class="input-icon-left">👤</span>
                                <input 
                                    type="text" 
                                    id="registerName" 
                                    class="form-input"
                                    placeholder="Full name"
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="input-icon-wrapper">
                                <span class="input-icon-left">✉</span>
                                <input 
                                    type="email" 
                                    id="registerEmail" 
                                    class="form-input"
                                    placeholder="Email"
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="input-icon-wrapper">
                                <span class="input-icon-left">🔒</span>
                                <input 
                                    type="password" 
                                    id="registerPassword" 
                                    class="form-input"
                                    placeholder="Password"
                                    required 
                                />
                                <button type="button" class="input-icon-right" onclick="togglePassword('registerPassword', this)" aria-label="Toggle password">👁‍🗨</button>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="input-icon-wrapper">
                                <span class="input-icon-left">✓</span>
                                <input 
                                    type="password" 
                                    id="registerConfirmPassword" 
                                    class="form-input"
                                    placeholder="Confirm of  password"
                                    required 
                                />
                                <button type="button" class="input-icon-right" onclick="togglePassword('registerConfirmPassword', this)" aria-label="Toggle password">👁</button>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn-primary btn-full">
                            Sign-up
                        </button>
                    </form>
                    
                    <div class="auth-divider">
                        <span>OR</span>
                    </div>
                    
                    <a href="#/login" class="btn-outlined">Sign-in</a>
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
        await authService.register(name, email, password, confirmPassword);
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
// VERIFICATION PAGE - Issue #69, #72
// ============================================
function renderVerification() {
    // Get token from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('verification-token');
    const type = urlParams.get('type');

    appContainer.innerHTML = `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card verification-card">
                    <div class="auth-header">
                        <h1 class="logo-text">Continium</h1>
                        <p class="auth-subtitle">Verification</p>
                    </div>
                    
                    <div id="verificationContent" class="verification-content">
                        ${token && type ? `
                            <div class="verification-loading">
                                <div class="spinner-large"></div>
                                <p>Verifying your email...</p>
                            </div>
                        ` : `
                            <div class="verification-message">
                                <p class="text-muted">Please enter the 6-digit code sent to example@email.com</p>
                                
                                <div class="verification-code-inputs">
                                    <input type="text" class="code-input" maxlength="1" />
                                    <input type="text" class="code-input" maxlength="1" />
                                    <input type="text" class="code-input" maxlength="1" />
                                    <input type="text" class="code-input" maxlength="1" />
                                    <input type="text" class="code-input" maxlength="1" />
                                    <input type="text" class="code-input" maxlength="1" />
                                </div>
                                
                                <p class="resend-timer">Resend code in <strong>00:59</strong></p>
                                
                                <button class="btn-primary btn-full" onclick="handleVerifyCode()">Verify</button>
                                
                                <p class="resend-text">Didn't receive the code?</p>
                                <a href="javascript:void(0)" class="resend-link">Send a new code</a>
                                
                                <br/>
                                <a href="#/login" class="back-to-signin">Back to Sign-in</a>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;

    // If token exists, verify automatically
    if (token && type) {
        verifyEmail(token, type);
    }
}

async function verifyEmail(token, type) {
    try {
        await authService.verifyEmail(token, type);

        document.getElementById('verificationContent').innerHTML = `
            <div class="verification-success">
                <div class="success-icon">✓</div>
                <h3>Email Verified!</h3>
                <p>Your account has been successfully verified.</p>
                <a href="#/login" class="btn-primary">ue to Login</a>
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
                            <input 
                                type="email" 
                                id="forgotEmail" 
                                class="form-input"
                                placeholder="Enter your email"
                                required 
                            />
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
        await authService.changePassword(email);

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


// Toggle password visibility utility
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input) {
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '👁';
        } else {
            input.type = 'password';
            btn.textContent = '👁‍🗨';
        }
    }
}
window.togglePassword = togglePassword;

// Export functions
window.renderLogin = renderLogin;
window.renderRegister = renderRegister;
window.renderVerification = renderVerification;
window.renderForgotPassword = renderForgotPassword;
