import { useState, useEffect } from 'react';
import { User } from '../types';

interface LoginError {
  message: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('screenShareUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call with potential failure
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate some login failures for demo
          if (email === 'error@test.com') {
            reject(new Error('Credenciales incorrectas'));
          } else {
            resolve(true);
          }
        }, 1000);
      });
      
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        createdAt: new Date()
      };
      
      setUser(mockUser);
      localStorage.setItem('screenShareUser', JSON.stringify(mockUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
    
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call with potential failure
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate email already exists
          if (email === 'exists@test.com') {
            reject(new Error('Este email ya está registrado'));
          } else {
            resolve(true);
          }
        }, 1000);
      });
      
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        createdAt: new Date()
      };
      
      setUser(mockUser);
      localStorage.setItem('screenShareUser', JSON.stringify(mockUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('screenShareUser');
  };

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError: () => setError(null)
  };
};