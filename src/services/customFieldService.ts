
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface CustomField {
  id: string;
  name: string;
  type: string;
  options: string[] | null;
}

export interface CreateCustomFieldDTO {
  name: string;
  type: string;
  options: string[] | null;
}

const customFieldService = {
  getAll: async (): Promise<CustomField[]> => {
    try {
      const response = await axios.get(`${API_URL}/custom-fields`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch custom fields:', error);
      throw error;
    }
  },
  
  createField: async (field: CreateCustomFieldDTO): Promise<CustomField> => {
    try {
      const response = await axios.post(`${API_URL}/custom-fields`, field);
      return response.data;
    } catch (error) {
      console.error('Failed to create custom field:', error);
      throw error;
    }
  },
  
  deleteField: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/custom-fields/${id}`);
    } catch (error) {
      console.error(`Failed to delete custom field with id ${id}:`, error);
      throw error;
    }
  }
};

export default customFieldService;
