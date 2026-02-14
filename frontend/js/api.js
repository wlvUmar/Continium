/**
 * API Client Wrapper
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = 'http://localhost:8000'; // TODO: Move to config

function buildUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}

function getAuthToken() {
    return localStorage.getItem('access_token');
}

async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    
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
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (err) {
        console.error('API Error:', err);
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
