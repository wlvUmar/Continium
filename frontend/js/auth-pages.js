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
                            <input 
                                type="email" 
                                id="loginEmail" 
                                class="form-input"
                                placeholder="Enter your email"
                                required 
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <input 
                                type="password" 
                                id="loginPassword" 
                                class="form-input"
                                placeholder="Enter your password"
                                required 
                            />
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
                            <input 
                                type="text" 
                                id="registerName" 
                                class="form-input"
                                placeholder="Enter your full name"
                                required 
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="registerEmail">Email</label>
                            <input 
                                type="email" 
                                id="registerEmail" 
                                class="form-input"
                                placeholder="Enter your email"
                                required 
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="registerPassword">Password</label>
                            <input 
                                type="password" 
                                id="registerPassword" 
                                class="form-input"
                                placeholder="Create a password"
                                required 
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="registerConfirmPassword">Confirm Password</label>
                            <input 
                                type="password" 
                                id="registerConfirmPassword" 
                                class="form-input"
                                placeholder="Confirm your password"
                                required 
                            />
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
                                <p>Please check your email for verification link.</p>
                                <p class="text-muted">We've sent a verification email to your address.</p>
                                <a href="#/login" class="btn-primary">Back to Login</a>
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


// Export functions
window.renderLogin = renderLogin;
window.renderRegister = renderRegister;
window.renderVerification = renderVerification;
window.renderForgotPassword = renderForgotPassword;
