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
    async register(name, email, password, rePassword) {
        const response = await api.post('/auth/register', {
            name,
            email,
            password,
            re_password: rePassword
        });
        
        // Auto-login after registration
        if (response.access_token) {
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('refresh_token', response.refresh_token);
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }
        }
        
        return response;
    },

    // Logout
    async logout() {
        try {
            await api.post('/auth/logout', {
                access_token: localStorage.getItem('access_token'),
                refresh_token: localStorage.getItem('refresh_token')
            });
        } finally {
            // Clear storage even if request fails
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        }
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
    }
};

window.authService = authService;
