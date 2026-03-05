/**
 * Authentication Service
 * Manages login, logout, and token handling
 */

const authService = {
    // Login user
    async login(email, password) {
        const response = await api.post('/auth/login', { email, password });
        
        if (response.access_token) {
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('refresh_token', response.refresh_token);
            
            // Store user data if provided
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }
        }
        
        return response;
    },

    // Register new user
    async register(name, email, password) {
        const response = await api.post('/auth/register', {
            full_name: name,
            email,
            password
        });

        // Store user data returned from registration
        if (response) {
            localStorage.setItem('user', JSON.stringify(response));
        }

        // Auto-login after registration to obtain tokens
        await this.login(email, password);

        return response;
    },

    // Logout
    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },

    // Check if user is logged in
    isAuthed() {
        return !!localStorage.getItem('access_token');
    },

    // Get current user
    getUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    },

    // Get current user from server
    async fetchUser() {
        const user = await api.get('/auth/me');
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
        return user;
    },

    // Verify email with token
    async verifyEmail(token, type) {
        const response = await api.post('/auth/verify-email', { token, type });
        return response;
    },

    // Request password reset link
    async changePassword(email) {
        const response = await api.post('/auth/forgot-password', { email });
        return response;
    }
};

window.authService = authService;
