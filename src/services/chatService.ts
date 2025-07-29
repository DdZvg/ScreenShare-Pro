import { supabase } from '../lib/supabase';
import { Message } from '../types';

export class ChatService {
  static async sendMessage(roomId: string, userId: string, content: string, messageType: 'text' | 'system' | 'file' = 'text') {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          user_id: userId,
          content,
          message_type: messageType,
        })
        .select(`
          *,
          users (name, avatar_url)
        `)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        roomId: data.room_id,
        userId: data.user_id,
        userName: data.users.name,
        userAvatar: data.users.avatar_url,
        content: data.content,
        messageType: data.message_type,
        createdAt: new Date(data.created_at),
      } as Message;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  static async getRoomMessages(roomId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          users (name, avatar_url)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map((msg: any) => ({
        id: msg.id,
        roomId: msg.room_id,
        userId: msg.user_id,
        userName: msg.users.name,
        userAvatar: msg.users.avatar_url,
        content: msg.content,
        messageType: msg.message_type,
        createdAt: new Date(msg.created_at),
      }));
    } catch (error) {
      console.error('Get room messages error:', error);
      return [];
    }
  }

  static subscribeToMessages(roomId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Get user info for the new message
          const { data: userData } = await supabase
            .from('users')
            .select('name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          const message: Message = {
            id: payload.new.id,
            roomId: payload.new.room_id,
            userId: payload.new.user_id,
            userName: userData?.name || 'Unknown',
            userAvatar: userData?.avatar_url,
            content: payload.new.content,
            messageType: payload.new.message_type,
            createdAt: new Date(payload.new.created_at),
          };

          callback(message);
        }
      )
      .subscribe();
  }
}