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

// Check if we should use mock data
const shouldUseMockData = () => {
  return process.env.NODE_ENV !== 'production' || 
         localStorage.getItem('use_mock_data') === 'true' ||
         localStorage.getItem('auth_token') === 'mock-token-for-development';
};

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your connection';
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Network error. Make sure your backend server is running';
      // If network error, immediately use mock data
      if (shouldUseMockData()) {
        console.log('Network error detected, using mock data');
        return Promise.resolve({ data: [], isMock: true });
      }
    } else if (error.response) {
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
    
    if (!error.config?.url?.includes('/auth/')) {
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

// Mock data for development
const mockCustomers = [
  {
    id: '1',
    name: 'John Doe',
    dob: new Date('1985-05-15'),
    phone: '555-123-4567',
    email: 'john.doe@example.com',
    occupation: 'Software Engineer',
    location: 'New York, NY',
    customFields: [
      { id: '1', name: 'Notes', type: 'text', value: 'Some notes here' },
      { id: '2', name: 'Customer Type', type: 'select', value: 'VIP' }
    ]
  },
  {
    id: '2',
    name: 'Jane Smith',
    dob: new Date('1990-08-21'),
    phone: '555-987-6543',
    email: 'jane.smith@example.com',
    occupation: 'Marketing Manager',
    location: 'San Francisco, CA',
    customFields: []
  }
];

// Default custom fields for development - using string IDs to match database
const mockCustomFields = [
  {
    id: '1',
    name: 'Notes',
    type: 'text',
    options: null
  },
  {
    id: '2',
    name: 'Customer Type',
    type: 'select',
    options: ['Regular', 'VIP', 'Corporate']
  },
  {
    id: '3',
    name: 'Annual Revenue',
    type: 'number',
    options: null
  }
];

// Parse custom field values from API response
const parseCustomFields = (customer) => {
  if (!customer) {
    return { customFields: [], dob: null };
  }

  let customFields = customer.customFields || [];
  if (!Array.isArray(customFields)) {
    customFields = [];
  }

  let dob = customer.dob;
  if (dob && typeof dob === 'string') {
    dob = new Date(dob);
  }

  return {
    ...customer,
    customFields,
    dob
  };
};

// Parse options for select fields
const parseCustomFieldOptions = (field) => {
  if (!field) return field;
  
  let options = field.options;
  
  // If options is a string, try to parse it as JSON
  if (options && typeof options === 'string') {
    try {
      // Handle comma-separated string format
      if (options.includes(',') && !options.startsWith('[')) {
        options = options.split(',').map(opt => opt.trim());
      } else {
        options = JSON.parse(options);
      }
    } catch (e) {
      console.warn(`Failed to parse options for field ${field.name}:`, e);
      // Return empty array instead of throwing
      options = [];
    }
  }
  
  return {
    ...field,
    options
  };
};

// Customer Service
export const customerService = {
  getAll: async () => {
    try {
      const response = await api.get('/customers');
      return response.data.map(customer => parseCustomFields(customer));
    } catch (error) {
      console.error('Error fetching customers, using mock data:', error);
      if (shouldUseMockData()) {
        console.log('Using mock customer data');
        return mockCustomers;
      }
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/customers/${id}`);
      return parseCustomFields(response.data);
    } catch (error) {
      if (shouldUseMockData()) {
        const mockCustomer = mockCustomers.find(c => c.id === id);
        if (mockCustomer) return mockCustomer;
      }
      throw error;
    }
  },
  create: async (customerData) => {
    // Get all available custom fields to ensure we only send valid IDs
    let availableCustomFields = [];
    
    try {
      // Try to get actual fields from server first
      const response = await api.get('/custom-fields');
      availableCustomFields = response.data.map(field => field.id.toString());
    } catch (error) {
      console.log('Could not fetch custom fields from server, using mock data');
      // If server request fails, use mock fields
      if (shouldUseMockData()) {
        availableCustomFields = mockCustomFields.map(field => field.id.toString());
      }
    }
    
    // Filter custom fields to only include ones that exist in the database
    const validCustomFields = Array.isArray(customerData.customFields) 
      ? customerData.customFields.filter(field => 
          field && field.id && availableCustomFields.includes(field.id.toString()))
      : [];
    
    const processedData = {
      ...customerData,
      customFields: validCustomFields
    };
    
    try {
      const response = await api.post('/customers', processedData);
      return parseCustomFields(response.data);
    } catch (error) {
      if (shouldUseMockData()) {
        // Create a mock customer with an ID
        const newCustomer = {
          id: Date.now().toString(),
          ...customerData,
          customFields: processedData.customFields,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockCustomers.push(newCustomer);
        return newCustomer;
      }
      throw error;
    }
  },
  update: async (id, customerData) => {
    // Get all available custom fields to ensure we only send valid IDs
    let availableCustomFields = [];
    
    try {
      // Try to get actual fields from server first
      const response = await api.get('/custom-fields');
      availableCustomFields = response.data.map(field => field.id.toString());
    } catch (error) {
      console.log('Could not fetch custom fields from server, using mock data');
      // If server request fails, use mock fields
      if (shouldUseMockData()) {
        availableCustomFields = mockCustomFields.map(field => field.id.toString());
      }
    }
    
    // Filter custom fields to only include ones that exist in the database
    const validCustomFields = Array.isArray(customerData.customFields) 
      ? customerData.customFields.filter(field => 
          field && field.id && availableCustomFields.includes(field.id.toString()))
      : [];
    
    const processedData = {
      ...customerData,
      customFields: validCustomFields
    };
    
    try {
      const response = await api.put(`/customers/${id}`, processedData);
      return parseCustomFields(response.data);
    } catch (error) {
      if (shouldUseMockData()) {
        // Update mock customer
        const index = mockCustomers.findIndex(c => c.id === id);
        if (index !== -1) {
          mockCustomers[index] = {
            ...mockCustomers[index],
            ...customerData,
            customFields: processedData.customFields,
            updatedAt: new Date()
          };
          return mockCustomers[index];
        }
      }
      throw error;
    }
  },
  delete: async (id) => {
    try {
      await api.delete(`/customers/${id}`);
      return true;
    } catch (error) {
      if (shouldUseMockData()) {
        const index = mockCustomers.findIndex(c => c.id === id);
        if (index !== -1) {
          mockCustomers.splice(index, 1);
        }
        return true;
      }
      throw error;
    }
  },
  search: async (query) => {
    try {
      const response = await api.get(`/customers/search/${query}`);
      return response.data.map(customer => parseCustomFields(customer));
    } catch (error) {
      if (shouldUseMockData()) {
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
    try {
      // Always check if we should use mock data first to avoid unnecessary API calls
      if (shouldUseMockData()) {
        console.log('Using default custom fields');
        return mockCustomFields;
      }
      
      const response = await api.get('/custom-fields');
      
      // Map and validate each field
      const parsedFields = response.data.map((field) => {
        try {
          return {
            ...parseCustomFieldOptions(field),
            // Ensure ID is a string to be consistent
            id: field.id.toString()
          };
        } catch (error) {
          console.error(`Error parsing field ${field.id}:`, error);
          return null;
        }
      }).filter(field => field !== null); // Remove any fields that failed to parse
      
      // Store the valid fields in the mock data to keep in sync
      if (parsedFields.length > 0) {
        // Update mockCustomFields to match the server data
        mockCustomFields.length = 0;
        parsedFields.forEach(field => mockCustomFields.push(field));
      }
      
      return parsedFields;
    } catch (error) {
      console.error('Error fetching custom fields, using default fields:', error);
      
      // Fallback to mock data if there's an error
      console.log('Using default custom fields');
      return mockCustomFields;
    }
  },
  create: async (fieldData) => {
    try {
      // Ensure options is properly formatted for the server
      const processedData = { ...fieldData };
      
      if (processedData.type === 'select' && Array.isArray(processedData.options)) {
        // Convert array to JSON string for server
        processedData.options = JSON.stringify(processedData.options);
      }
      
      console.log('Sending field data to server:', processedData);
      const response = await api.post('/custom-fields', processedData);
      
      // Parse and format the response
      const newField = parseCustomFieldOptions(response.data);
      
      // Ensure ID is a string for consistency
      newField.id = newField.id.toString();
      
      // Add to mock data to keep in sync
      if (shouldUseMockData()) {
        mockCustomFields.push(newField);
      }
      
      return newField;
    } catch (error) {
      console.error('Error creating custom field:', error);
      if (shouldUseMockData()) {
        // Simulate creating a new field with a unique ID
        const newField = {
          ...fieldData,
          id: Date.now().toString(),
        };
        mockCustomFields.push(newField);
        return newField;
      }
      throw error;
    }
  },
  update: async (id, fieldData) => {
    try {
      // Ensure options is properly formatted for the server
      const processedData = { ...fieldData };
      
      if (processedData.type === 'select' && Array.isArray(processedData.options)) {
        // Convert array to JSON string for server
        processedData.options = JSON.stringify(processedData.options);
      }
      
      console.log('Updating field data on server:', id, processedData);
      const response = await api.put(`/custom-fields/${id}`, processedData);
      
      // Parse and format the response
      const updatedField = parseCustomFieldOptions(response.data);
      
      // Ensure ID is a string for consistency
      updatedField.id = updatedField.id.toString();
      
      // Update mock data to keep in sync
      if (shouldUseMockData()) {
        const index = mockCustomFields.findIndex(f => f.id === id.toString());
        if (index !== -1) {
          mockCustomFields[index] = updatedField;
        }
      }
      
      return updatedField;
    } catch (error) {
      console.error('Error updating custom field:', error);
      if (shouldUseMockData()) {
        // Update the mock field
        const index = mockCustomFields.findIndex(f => f.id === id.toString());
        if (index !== -1) {
          mockCustomFields[index] = { ...mockCustomFields[index], ...fieldData };
          return mockCustomFields[index];
        }
      }
      throw error;
    }
  },
  delete: async (id) => {
    if (!id) {
      throw new Error('Field ID is required');
    }

    try {
      // Attempt to delete from the server
      await api.delete(`/custom-fields/${id}`);
      
      // If successful, also update local mock data to stay in sync
      if (shouldUseMockData()) {
        const index = mockCustomFields.findIndex(f => f.id === id.toString());
        if (index !== -1) {
          mockCustomFields.splice(index, 1);
        }
      }
      
      // Also remove this field from all mock customers to maintain consistency
      mockCustomers.forEach(customer => {
        customer.customFields = customer.customFields.filter(field => field.id !== id.toString());
      });

      return true;
    } catch (error) {
      console.error('Error deleting custom field:', error);
      
      // Only use mock data if we're supposed to
      if (shouldUseMockData()) {
        // Remove from mock data
        const index = mockCustomFields.findIndex(f => f.id === id.toString());
        if (index !== -1) {
          mockCustomFields.splice(index, 1);
          
          // Also remove this field from all mock customers
          mockCustomers.forEach(customer => {
            customer.customFields = customer.customFields.filter(field => field.id !== id.toString());
          });
        }
        return true;
      }
      throw error;
    }
  }
};

// Auth Service
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    return response.data;
  }
};

export default api;
