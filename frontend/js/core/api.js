const API_BASE_URL = "http://127.0.0.1:8000/api/v1";
function buildUrl(endpoint) {
  return `${API_BASE_URL}${endpoint}`;
}

function getAuthToken() {
  return localStorage.getItem("access_token");
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  console.log(buildUrl(endpoint));

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(buildUrl(endpoint), config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      // FastAPI uses "detail", express-style APIs use "message"
      const detail = error.detail || error.message;
      const msg = Array.isArray(detail)
        ? detail.map((e) => e.msg || JSON.stringify(e)).join(", ")
        : detail || `HTTP ${response.status}`;
      throw new Error(msg);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

const api = {
  get: (endpoint) => apiRequest(endpoint, { method: "GET" }),

  post: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "POST",
      body: data,
    }),

  put: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: data,
    }),

  delete: (endpoint) => apiRequest(endpoint, { method: "DELETE" }),
};

window.api = api;
