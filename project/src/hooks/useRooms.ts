import { useState, useEffect } from 'react';
import { Room, User } from '../types';
import { generateRoomCode } from '../utils/roomCode';

export const useRooms = (user: User | null) => {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (user) {
      // Load rooms from localStorage or API
      const savedRooms = localStorage.getItem(`rooms_${user.id}`);
      if (savedRooms) {
        const parsedRooms = JSON.parse(savedRooms);
        // Convert string dates back to Date objects
        const roomsWithDates = parsedRooms.map((room: any) => ({
          ...room,
          createdAt: new Date(room.createdAt),
          participants: room.participants.map((participant: any) => ({
            ...participant,
            joinedAt: new Date(participant.joinedAt)
          }))
        }));
        setRooms(roomsWithDates);
      }
    }
  }, [user]);

  const saveRooms = (updatedRooms: Room[]) => {
    if (user) {
      setRooms(updatedRooms);
      localStorage.setItem(`rooms_${user.id}`, JSON.stringify(updatedRooms));
    }
  };

  const createRoom = (name: string, maxParticipants: number) => {
    if (!user) return;

    const newRoom: Room = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      code: generateRoomCode(),
      hostId: user.id,
      hostName: user.name,
      isActive: true,
      participants: [{
        id: user.id,
        name: user.name,
        email: user.email,
        joinedAt: new Date(),
        isHost: true
      }],
      createdAt: new Date(),
      maxParticipants
    };

    const updatedRooms = [newRoom, ...rooms];
    saveRooms(updatedRooms);
    return newRoom;
  };

  const joinRoom = (code: string) => {
    if (!user) return null;

    // In a real implementation, this would query the backend
    // For demo, we'll create a mock room
    const mockRoom: Room = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Sala ${code}`,
      code,
      hostId: 'host_id',
      hostName: 'Usuario Host',
      isActive: true,
      participants: [
        {
          id: 'host_id',
          name: 'Usuario Host',
          email: 'host@example.com',
          joinedAt: new Date(Date.now() - 300000),
          isHost: true
        },
        {
          id: user.id,
          name: user.name,
          email: user.email,
          joinedAt: new Date(),
          isHost: false
        }
      ],
      createdAt: new Date(Date.now() - 300000),
      maxParticipants: 10
    };

    return mockRoom;
  };

  const endRoom = (roomId: string) => {
    const updatedRooms = rooms.map(room =>
      room.id === roomId
        ? { ...room, isActive: false }
        : room
    );
    saveRooms(updatedRooms);
  };

  return {
    rooms,
    createRoom,
    joinRoom,
    endRoom
  };
};