import { format } from "date-fns";

// Define the customer type
export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[]; // For select fields
  value?: string | number | Date | null;
}

export interface Customer {
  id: string;
  name: string;
  dob: Date | null;
  phone: string;
  email: string;
  occupation: string;
  location: string;
  customFields: CustomField[];
  createdAt: Date;
  updatedAt: Date;
}

// Mock data for development
export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    dob: new Date(1990, 5, 15),
    phone: '(555) 123-4567',
    email: 'john.doe@example.com',
    occupation: 'Software Engineer',
    location: 'San Francisco, CA',
    customFields: [],
    createdAt: new Date(2023, 1, 15),
    updatedAt: new Date(2023, 2, 20),
  },
  {
    id: '2',
    name: 'Jane Smith',
    dob: new Date(1985, 8, 22),
    phone: '(555) 987-6543',
    email: 'jane.smith@example.com',
    occupation: 'Product Manager',
    location: 'New York, NY',
    customFields: [],
    createdAt: new Date(2023, 2, 10),
    updatedAt: new Date(2023, 3, 5),
  },
  {
    id: '3',
    name: 'Michael Johnson',
    dob: new Date(1978, 3, 8),
    phone: '(555) 456-7890',
    email: 'michael.j@example.com',
    occupation: 'Marketing Director',
    location: 'Chicago, IL',
    customFields: [],
    createdAt: new Date(2023, 3, 20),
    updatedAt: new Date(2023, 3, 20),
  },
  {
    id: '4',
    name: 'Emily Williams',
    dob: new Date(1992, 11, 30),
    phone: '(555) 234-5678',
    email: 'emily.w@example.com',
    occupation: 'Graphic Designer',
    location: 'Austin, TX',
    customFields: [],
    createdAt: new Date(2023, 4, 5),
    updatedAt: new Date(2023, 4, 15),
  },
  {
    id: '5',
    name: 'David Brown',
    dob: new Date(1983, 7, 12),
    phone: '(555) 876-5432',
    email: 'david.b@example.com',
    occupation: 'Financial Analyst',
    location: 'Boston, MA',
    customFields: [],
    createdAt: new Date(2023, 4, 25),
    updatedAt: new Date(2023, 5, 1),
  },
];

// Default custom fields
export const defaultCustomFields: CustomField[] = [
  { id: 'cf1', name: 'Notes', type: 'text' },
  { id: 'cf2', name: 'Customer Type', type: 'select', options: ['Regular', 'VIP', 'Corporate'] },
  { id: 'cf3', name: 'Annual Revenue', type: 'number' },
];

// CRUD operations
export const getCustomers = (): Customer[] => {
  const savedCustomers = localStorage.getItem('customers');
  if (savedCustomers) {
    try {
      // Parse the dates properly
      const parsed = JSON.parse(savedCustomers);
      return parsed.map((customer: any) => ({
        ...customer,
        dob: customer.dob ? new Date(customer.dob) : null,
        createdAt: new Date(customer.createdAt),
        updatedAt: new Date(customer.updatedAt),
      }));
    } catch (error) {
      console.error('Error parsing customers from localStorage', error);
      return mockCustomers;
    }
  }
  
  // If no saved customers, use mock data and save it
  localStorage.setItem('customers', JSON.stringify(mockCustomers));
  return mockCustomers;
};

export const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const updatedCustomers = [newCustomer, ...customers];
  localStorage.setItem('customers', JSON.stringify(updatedCustomers));
  return newCustomer;
};

export const updateCustomer = (id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>): Customer | null => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  const updatedCustomer = {
    ...customers[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  customers[index] = updatedCustomer;
  localStorage.setItem('customers', JSON.stringify(customers));
  return updatedCustomer;
};

export const deleteCustomer = (id: string): boolean => {
  const customers = getCustomers();
  const updatedCustomers = customers.filter(c => c.id !== id);
  
  if (updatedCustomers.length === customers.length) return false;
  
  localStorage.setItem('customers', JSON.stringify(updatedCustomers));
  return true;
};

export const searchCustomers = (query: string): Customer[] => {
  const customers = getCustomers();
  const lowerQuery = query.toLowerCase();
  
  return customers.filter(customer => 
    customer.name.toLowerCase().includes(lowerQuery) ||
    customer.phone.includes(query) ||
    customer.email.toLowerCase().includes(lowerQuery)
  );
};

// Custom fields management
export const getCustomFields = (): CustomField[] => {
  const savedFields = localStorage.getItem('customFields');
  if (savedFields) {
    try {
      return JSON.parse(savedFields);
    } catch (error) {
      console.error('Error parsing custom fields from localStorage', error);
      return defaultCustomFields;
    }
  }
  
  // If no saved fields, use defaults and save them
  localStorage.setItem('customFields', JSON.stringify(defaultCustomFields));
  return defaultCustomFields;
};

export const addCustomField = (field: Omit<CustomField, 'id'>): CustomField => {
  const fields = getCustomFields();
  const newField: CustomField = {
    ...field,
    id: Math.random().toString(36).substr(2, 9),
  };
  
  const updatedFields = [...fields, newField];
  localStorage.setItem('customFields', JSON.stringify(updatedFields));
  return newField;
};

export const updateCustomField = (id: string, updates: Partial<Omit<CustomField, 'id'>>): CustomField | null => {
  const fields = getCustomFields();
  const index = fields.findIndex(f => f.id === id);
  
  if (index === -1) return null;
  
  const updatedField = {
    ...fields[index],
    ...updates,
  };
  
  fields[index] = updatedField;
  localStorage.setItem('customFields', JSON.stringify(fields));
  return updatedField;
};

export const deleteCustomField = (id: string): boolean => {
  const fields = getCustomFields();
  const updatedFields = fields.filter(f => f.id !== id);
  
  if (updatedFields.length === fields.length) return false;
  
  localStorage.setItem('customFields', JSON.stringify(updatedFields));
  
  // Also update all customers to remove this field
  const customers = getCustomers();
  const updatedCustomers = customers.map(customer => ({
    ...customer,
    customFields: customer.customFields.filter(f => f.id !== id),
  }));
  
  localStorage.setItem('customers', JSON.stringify(updatedCustomers));
  return true;
};

// Excel export
export const generateExcelData = (
  customers: Customer[], 
  customFields: CustomField[] = [], 
  onlyIncludeAssociatedFields: boolean = false,
  includeBaseFields: boolean = true
): any[] => {
  // Create a map of field IDs to names for easier lookup
  const fieldMap = new Map(
    customFields.map(field => [field.id, field.name])
  );
  
  // Filter out customers with no custom fields if onlyIncludeAssociatedFields is true
  const filteredCustomers = onlyIncludeAssociatedFields 
    ? customers.filter(customer => customer.customFields && customer.customFields.length > 0)
    : customers;

  // If no customers have custom fields and we're only including associated fields, return empty array
  if (onlyIncludeAssociatedFields && filteredCustomers.length === 0) {
    return [];
  }

  return filteredCustomers.map(customer => {
    const baseData: Record<string, any> = {};
    
    if (includeBaseFields) {
      baseData['Name'] = customer.name;
      baseData['Date of Birth'] = customer.dob ? format(customer.dob, 'yyyy-MM-dd') : '';
      baseData['Phone'] = customer.phone;
      baseData['Email'] = customer.email;
      baseData['Occupation'] = customer.occupation;
      baseData['Location'] = customer.location;
    }
    
    // Create a map of the customer's custom field values for easy lookup
    const customerFieldMap = new Map(
      (customer.customFields || []).map(cf => [cf.id, cf.value])
    );
    
    // Add only the custom fields that are associated with this customer
    const customFieldData = {};
    customFields.forEach(field => {
      if (!onlyIncludeAssociatedFields || customerFieldMap.has(field.id)) {
        customFieldData[field.name] = customerFieldMap.get(field.id) || '';
      }
    });

    return {
      ...baseData,
      ...customFieldData
    };
  });
};
