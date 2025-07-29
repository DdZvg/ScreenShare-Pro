import { supabase } from '../lib/supabase';
import { Room, Participant, User } from '../types';
import { generateRoomCode } from '../utils/roomCode';

export class RoomService {
  static async createRoom(name: string, maxParticipants: number, hostId: string) {
    try {
      const code = generateRoomCode();
      
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          name,
          code,
          host_id: hostId,
          max_participants: maxParticipants,
          is_active: true,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add host as participant
      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          room_id: roomData.id,
          user_id: hostId,
          is_host: true,
        });

      if (participantError) throw participantError;

      return await this.getRoomById(roomData.id);
    } catch (error) {
      console.error('Create room error:', error);
      throw error;
    }
  }

  static async getRoomById(roomId: string): Promise<Room | null> {
    try {
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select(`
          *,
          participants (
            *,
            users (*)
          )
        `)
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;

      const hostUser = roomData.participants.find((p: any) => p.is_host)?.users;
      
      return {
        id: roomData.id,
        name: roomData.name,
        code: roomData.code,
        hostId: roomData.host_id,
        hostName: hostUser?.name || 'Unknown',
        isActive: roomData.is_active,
        maxParticipants: roomData.max_participants,
        createdAt: new Date(roomData.created_at),
        participants: roomData.participants
          .filter((p: any) => !p.left_at)
          .map((p: any) => ({
            id: p.user_id,
            name: p.users.name,
            email: p.users.email,
            avatar: p.users.avatar_url,
            joinedAt: new Date(p.joined_at),
            isHost: p.is_host,
          })),
      };
    } catch (error) {
      console.error('Get room error:', error);
      return null;
    }
  }

  static async getRoomByCode(code: string): Promise<Room | null> {
    try {
      const { data: roomData, error } = await supabase
        .from('rooms')
        .select(`
          *,
          participants (
            *,
            users (*)
          )
        `)
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) return null;

      const hostUser = roomData.participants.find((p: any) => p.is_host)?.users;
      
      return {
        id: roomData.id,
        name: roomData.name,
        code: roomData.code,
        hostId: roomData.host_id,
        hostName: hostUser?.name || 'Unknown',
        isActive: roomData.is_active,
        maxParticipants: roomData.max_participants,
        createdAt: new Date(roomData.created_at),
        participants: roomData.participants
          .filter((p: any) => !p.left_at)
          .map((p: any) => ({
            id: p.user_id,
            name: p.users.name,
            email: p.users.email,
            avatar: p.users.avatar_url,
            joinedAt: new Date(p.joined_at),
            isHost: p.is_host,
          })),
      };
    } catch (error) {
      console.error('Get room by code error:', error);
      return null;
    }
  }

  static async joinRoom(roomId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('participants')
        .insert({
          room_id: roomId,
          user_id: userId,
          is_host: false,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Join room error:', error);
      throw error;
    }
  }

  static async leaveRoom(roomId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('participants')
        .update({ left_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Leave room error:', error);
      throw error;
    }
  }

  static async endRoom(roomId: string) {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId);

      if (error) throw error;
    } catch (error) {
      console.error('End room error:', error);
      throw error;
    }
  }

  static async getUserRooms(userId: string): Promise<Room[]> {
    try {
      const { data: participantData, error } = await supabase
        .from('participants')
        .select(`
          rooms (
            *,
            participants (
              *,
              users (*)
            )
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      return participantData
        .map((p: any) => p.rooms)
        .filter((room: any) => room)
        .map((roomData: any) => {
          const hostUser = roomData.participants.find((p: any) => p.is_host)?.users;
          
          return {
            id: roomData.id,
            name: roomData.name,
            code: roomData.code,
            hostId: roomData.host_id,
            hostName: hostUser?.name || 'Unknown',
            isActive: roomData.is_active,
            maxParticipants: roomData.max_participants,
            createdAt: new Date(roomData.created_at),
            participants: roomData.participants
              .filter((p: any) => !p.left_at)
              .map((p: any) => ({
                id: p.user_id,
                name: p.users.name,
                email: p.users.email,
                avatar: p.users.avatar_url,
                joinedAt: new Date(p.joined_at),
                isHost: p.is_host,
              })),
          };
        });
    } catch (error) {
      console.error('Get user rooms error:', error);
      return [];
    }
  }
}