
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/api';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development without backend
const MOCK_USER: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved authentication on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Call the login API
      const response = await authService.login(email, password);
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      
      // For development: use mock authentication if backend is not available
      if (email === 'admin@example.com' && password === 'password') {
        console.log('Using mock authentication');
        // Store mock data
        localStorage.setItem('auth_user', JSON.stringify(MOCK_USER));
        localStorage.setItem('auth_token', 'mock-token-for-development');
        setUser(MOCK_USER);
        toast.success('Logged in with mock user');
        return true;
      }
      
      return false;
    }
  };

  const logout = () => {
    try {
      authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    // Always clear local storage and state
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
