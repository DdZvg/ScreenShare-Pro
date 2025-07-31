import { useState, useEffect } from 'react';
import { Room, User } from '../types';
import { RoomService } from '../services/roomService';
import toast from 'react-hot-toast';

export const useRooms = (user: User | null) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserRooms();
    } else {
      setRooms([]);
    }
  }, [user]);

  const loadUserRooms = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userRooms = await RoomService.getUserRooms(user.id);
      setRooms(userRooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast.error('Error al cargar las salas');
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async (name: string, maxParticipants: number) => {
    if (!user) return null;

    try {
      const newRoom = await RoomService.createRoom(name, maxParticipants, user.id);
      if (newRoom) {
        setRooms(prev => [newRoom, ...prev]);
        toast.success('Sala creada exitosamente');
        return newRoom;
      }
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Error al crear la sala');
    }
    return null;
  };

  const joinRoom = async (code: string) => {
    if (!user) return null;

    try {
      const room = await RoomService.getRoomByCode(code);
      if (!room) {
        toast.error('Sala no encontrada');
        return null;
      }

      if (room.participants.length >= room.maxParticipants) {
        toast.error('La sala está llena');
        return null;
      }

      // Check if user is already in the room
      const isAlreadyParticipant = room.participants.some(p => p.id === user.id);
      if (!isAlreadyParticipant) {
        await RoomService.joinRoom(room.id, user.id);
      }

      toast.success(`Te uniste a ${room.name}`);
      await loadUserRooms(); // Refresh rooms list
      return room;
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Error al unirse a la sala');
      return null;
    }
  };

  const endRoom = async (roomId: string) => {
    try {
      await RoomService.endRoom(roomId);
      setRooms(prev => prev.map(room => 
        room.id === roomId ? { ...room, isActive: false } : room
      ));
      toast.success('Sala finalizada');
    } catch (error) {
      console.error('Error ending room:', error);
      toast.error('Error al finalizar la sala');
    }
  };

  const leaveRoom = async (roomId: string) => {
    if (!user) return;

    try {
      await RoomService.leaveRoom(roomId, user.id);
      await loadUserRooms(); // Refresh rooms list
      toast.success('Has salido de la sala');
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Error al salir de la sala');
    }
  };

  return {
    rooms,
    isLoading,
    createRoom,
    joinRoom,
    endRoom,
    leaveRoom,
    refreshRooms: loadUserRooms
  };
};