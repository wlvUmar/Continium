/**
 * Login Page
 * Extracted from auth-pages.js
 */

function renderLogin() {
    const appContainer = document.getElementById('app');
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
                                <input type="email" id="loginEmail" class="form-input with-icon" placeholder="Enter your email" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <div class="input-wrapper">
                                <img src="assets/icons/mdi_password.svg" class="input-icon" alt="">
                                <input type="password" id="loginPassword" class="form-input with-icon with-toggle" placeholder="Enter your password" required>
                                <button type="button" class="password-toggle" onclick="togglePassword('loginPassword', this)">
                                    <img src="assets/icons/wpf_invisible.svg" alt="Show password">
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="btn-primary btn-full">Sign In</button>
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
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
    e.preventDefault();
    const email    = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    ErrorMessage.clear(document.querySelector('.auth-card'));
    Spinner.show('Logging in...');
    try {
        await authService.login(email, password);
        Toast.success('Welcome back!');
        router.navigate('/app');
    } catch (err) {
        const msg = err.message || 'Login failed. Please check your credentials.';
        Toast.error(msg);
        ErrorMessage.render(msg, document.querySelector('.auth-form'));
    } finally {
        Spinner.hide();
    }
}

window.renderLogin = renderLogin;
