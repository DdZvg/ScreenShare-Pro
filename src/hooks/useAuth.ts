import { useState, useEffect } from 'react';
import { User } from '../types';
import { AuthService } from '../services/authService';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.signIn(email, password);
      toast.success('¡Bienvenido de vuelta!');
    } catch (err: any) {
      const errorMessage = err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.signUp(email, password, name);
      toast.success('¡Cuenta creada exitosamente!');
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear la cuenta';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      toast.success('Sesión cerrada');
    } catch (err: any) {
      toast.error('Error al cerrar sesión');
    }
  };

  const clearError = () => setError(null);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError
  };
};