/**
 * API Client Wrapper
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = 'http://localhost:8000'; // TODO: Move to config

// Helper to build full API URLs
function buildUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}

// Get auth token from storage
function getAuthToken() {
    return localStorage.getItem('access_token');
}

// Main API request wrapper
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
        
        // Handle different response types
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        // Some endpoints return no content
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (err) {
        console.error('API Error:', err);
        throw err;
    }
}

// Convenience methods
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

// Export for use in other files
window.api = api;
