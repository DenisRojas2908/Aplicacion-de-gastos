import axios from 'axios';

// 1. Configuración de la URL Base
// Detectamos si estamos en producción (Render) o en local
// Y le agregamos el "/api" al final para que coincida con tu backend.
const baseURL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` // En Producción (Render)
  : 'http://localhost:3001/api';           // En Local

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Solicitud (Request)
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

// 3. Interceptor de Respuesta (Response)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirigir al login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;