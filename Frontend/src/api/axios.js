import axios from 'axios';

const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const defaultApiBaseUrl = isLocalHost
    ? 'http://localhost:8080/api'
    : 'https://medibook-production-3b64.up.railway.app/api';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl;

const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;