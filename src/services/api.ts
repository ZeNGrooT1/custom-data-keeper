
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Customer Service
export const customerService = {
  getAll: async () => {
    const response = await api.get('/customers');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  create: async (customerData: any) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },
  update: async (id: string, customerData: any) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/customers/${id}`);
    return true;
  },
  search: async (query: string) => {
    const response = await api.get(`/customers/search/${query}`);
    return response.data;
  }
};

// Custom Fields Service
export const customFieldService = {
  getAll: async () => {
    const response = await api.get('/custom-fields');
    return response.data;
  },
  create: async (fieldData: any) => {
    const response = await api.post('/custom-fields', fieldData);
    return response.data;
  },
  update: async (id: string, fieldData: any) => {
    const response = await api.put(`/custom-fields/${id}`, fieldData);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/custom-fields/${id}`);
    return true;
  }
};

// Auth Service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    // Save token in localStorage
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    return response.data;
  }
};

export default api;
