import axios from 'axios';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Create a more user-friendly error message
    let errorMessage = 'An unexpected error occurred';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your connection';
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Network error. Make sure your backend server is running';
    } else if (error.response) {
      // Server responded with an error status
      const status = error.response.status;
      const serverMessage = error.response.data?.error || error.response.data?.message;
      
      if (status === 401) {
        errorMessage = 'Authentication error. Please log in again';
      } else if (status === 404) {
        errorMessage = 'Resource not found';
      } else if (serverMessage) {
        errorMessage = serverMessage;
      } else {
        errorMessage = `Server error (${status})`;
      }
    }
    
    // Show toast for most errors except auth errors (those are handled separately)
    if (!error.config?.url?.includes('/auth/')) {
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

// Mock data for development when backend is unavailable
const mockCustomers = [
  {
    id: '1',
    name: 'John Doe',
    dob: new Date('1985-05-15'),
    phone: '555-123-4567',
    email: 'john.doe@example.com',
    occupation: 'Software Engineer',
    location: 'New York, NY',
    customFields: {}
  },
  {
    id: '2',
    name: 'Jane Smith',
    dob: new Date('1990-08-21'),
    phone: '555-987-6543',
    email: 'jane.smith@example.com',
    occupation: 'Marketing Manager',
    location: 'San Francisco, CA',
    customFields: {}
  }
];

// Customer Service
export const customerService = {
  getAll: async () => {
    try {
      const response = await api.get('/customers');
      return response.data;
    } catch (error) {
      console.error('Error fetching customers, using mock data:', error);
      
      // For development: return mock data if backend is not available
      if (process.env.NODE_ENV !== 'production' || localStorage.getItem('use_mock_data') === 'true') {
        console.log('Using mock customer data');
        return mockCustomers;
      }
      
      throw error;
    }
  },
  getById: async (id: string) => {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      // For development: return mock data if backend is not available
      if (process.env.NODE_ENV !== 'production' || localStorage.getItem('use_mock_data') === 'true') {
        const mockCustomer = mockCustomers.find(c => c.id === id);
        if (mockCustomer) return mockCustomer;
      }
      throw error;
    }
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
    try {
      const response = await api.get(`/customers/search/${query}`);
      return response.data;
    } catch (error) {
      // For development: filter mock data if backend is not available
      if (process.env.NODE_ENV !== 'production' || localStorage.getItem('use_mock_data') === 'true') {
        const filtered = mockCustomers.filter(c => 
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.email.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query)
        );
        return filtered;
      }
      throw error;
    }
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
