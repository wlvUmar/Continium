/**
 * API Client Wrapper
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = 'http://127.0.0.1:8000';

function buildUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}

function getAuthToken() {
    return localStorage.getItem('access_token');
}

async function apiRequest(endpoint, options = {}) {
    const isAuthRoute = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');
    const token = getAuthToken();

    // Prevent non-auth requests if token is missing
    if (!isAuthRoute && !token) {
        console.warn('API Request blocked: No auth token found');
        throw new Error('No auth token found');
    }

    const config = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        }
    };

    if (options.body) {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(buildUrl(endpoint), config);

        if (response.status === 401) {
            // Handle unauthorized safely without clearing entire localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            if (window.router) {
                window.router.navigate('/login');
            }
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Ignore JSON parse errors for non-JSON error responses
            }
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (err) {
        console.error(`API Error on ${endpoint}:`, err);
        throw err;
    }
}

const api = {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),

    post: (endpoint, data) => apiRequest(endpoint, {
        method: 'POST',
        body: data
    }),

    put: (endpoint, data) => apiRequest(endpoint, {
        method: 'PUT',
        body: data
    }),

    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};

window.api = api;
