
// Customer type
export interface Customer {
  id: string;
  name: string;
  dob: Date | null;
  phone: string;
  email: string;
  occupation: string;
  location: string;
  customFields: CustomFieldValue[];
}

// Custom field type
export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options: string[] | null;
}

// Custom field value type
export interface CustomFieldValue extends CustomField {
  value: string | number | boolean | null;
}

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Auth type
export interface Auth {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
