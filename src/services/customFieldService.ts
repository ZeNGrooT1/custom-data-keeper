
import axios from 'axios';
import { CustomField } from '../types';
import { parseCustomFieldOptions } from './api';

// Create a base URL for the API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Function to get all custom fields
export async function getAll(): Promise<CustomField[]> {
  try {
    const response = await axios.get(`${API_URL}/custom-fields`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || 'mock-token-for-development'}`
      }
    });
    
    // Process the response to ensure options are parsed correctly
    return response.data.map(parseCustomFieldOptions);
  } catch (error) {
    console.error('Failed to fetch custom fields:', error);
    
    // Return mock data for development purposes
    return [
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
  }
}

// Function to create a new custom field
export async function create(data: Omit<CustomField, 'id'>): Promise<CustomField> {
  const response = await axios.post(`${API_URL}/custom-fields`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || 'mock-token-for-development'}`
    }
  });
  return parseCustomFieldOptions(response.data);
}

// Function to update a custom field
export async function update(id: string, data: Partial<Omit<CustomField, 'id'>>): Promise<CustomField> {
  const response = await axios.put(`${API_URL}/custom-fields/${id}`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || 'mock-token-for-development'}`
    }
  });
  return parseCustomFieldOptions(response.data);
}

// Function to delete a custom field
export async function remove(id: string): Promise<void> {
  await axios.delete(`${API_URL}/custom-fields/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || 'mock-token-for-development'}`
    }
  });
}

const customFieldService = {
  getAll,
  create,
  update,
  remove
};

export default customFieldService;
