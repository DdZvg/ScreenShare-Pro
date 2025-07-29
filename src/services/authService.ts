import { supabase } from '../lib/supabase';
import { User } from '../types';

export class AuthService {
  static async signUp(email: string, password: string, name: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            name,
          });

        if (profileError) throw profileError;
      }

      return authData;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar_url,
        createdAt: new Date(profile.created_at),
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async updateProfile(userId: string, updates: Partial<{ name: string; avatar_url: string }>) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
}