import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          updated_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          name: string;
          code: string;
          host_id: string;
          is_active: boolean;
          max_participants: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          host_id: string;
          is_active?: boolean;
          max_participants: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          host_id?: string;
          is_active?: boolean;
          max_participants?: number;
          updated_at?: string;
        };
      };
      participants: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          is_host: boolean;
          joined_at: string;
          left_at?: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          is_host?: boolean;
          joined_at?: string;
          left_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          is_host?: boolean;
          left_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          content: string;
          message_type: 'text' | 'system' | 'file';
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          content: string;
          message_type?: 'text' | 'system' | 'file';
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          content?: string;
          message_type?: 'text' | 'system' | 'file';
        };
      };
    };
  };
}