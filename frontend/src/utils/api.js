import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Pointing to the Express backend
});

// Request interceptor to add the standard auth header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
