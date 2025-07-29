@@ .. @@
-import { useState, useEffect } from 'react';
-import { Room, User } from '../types';
-import { generateRoomCode } from '../utils/roomCode';
+import { useState, useEffect } from 'react';
+import { Room, User } from '../types';
+import { RoomService } from '../services/roomService';
+import toast from 'react-hot-toast';

 export const useRooms = (user: User | null) => {
   const [rooms, setRooms] = useState<Room[]>([]);
+  const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
-    if (user) {
-      // Load rooms from localStorage or API
-      const savedRooms = localStorage.getItem(`rooms_${user.id}`);
-      if (savedRooms) {
-        const parsedRooms = JSON.parse(savedRooms);
-        // Convert string dates back to Date objects
-        const roomsWithDates = parsedRooms.map((room: any) => ({
-          ...room,
-          createdAt: new Date(room.createdAt),
-          participants: room.participants.map((participant: any) => ({
-            ...participant,
-            joinedAt: new Date(participant.joinedAt)
-          }))
-        }));
-        setRooms(roomsWithDates);
-      }
-    }
+    loadUserRooms();
   }, [user]);

-  const saveRooms = (updatedRooms: Room[]) => {
+  const loadUserRooms = async () => {
     if (user) {
-      setRooms(updatedRooms);
-      localStorage.setItem(`rooms_${user.id}`, JSON.stringify(updatedRooms));
+      setIsLoading(true);
+      try {
+        const userRooms = await RoomService.getUserRooms(user.id);
+        setRooms(userRooms);
+      } catch (error) {
+        console.error('Error loading rooms:', error);
+        toast.error('Error al cargar las salas');
+      }
+      setIsLoading(false);
     }
   };

-  const createRoom = (name: string, maxParticipants: number) => {
-    if (!user) return;
+  const createRoom = async (name: string, maxParticipants: number) => {
+    if (!user) return null;

-    const newRoom: Room = {
-      id: Math.random().toString(36).substr(2, 9),
-      name,
-      code: generateRoomCode(),
-      hostId: user.id,
-      hostName: user.name,
-      isActive: true,
-      participants: [{
-        id: user.id,
-        name: user.name,
-        email: user.email,
-        joinedAt: new Date(),
-        isHost: true
-      }],
-      createdAt: new Date(),
-      maxParticipants
-    };
+    setIsLoading(true);
+    try {
+      const newRoom = await RoomService.createRoom(name, maxParticipants, user.id);
+      if (newRoom) {
+        setRooms(prev => [newRoom, ...prev]);
+        toast.success('¡Sala creada exitosamente!');
+        return newRoom;
+      }
+    } catch (error) {
+      console.error('Error creating room:', error);
+      toast.error('Error al crear la sala');
+    }
+    setIsLoading(false);
+    return null;
+  };

-    const updatedRooms = [newRoom, ...rooms];
-    saveRooms(updatedRooms);
-    return newRoom;
+  const joinRoom = async (code: string) => {
+    if (!user) return null;
+
+    setIsLoading(true);
+    try {
+      const room = await RoomService.getRoomByCode(code);
+      if (room) {
+        // Check if room is full
+        if (room.participants.length >= room.maxParticipants) {
+          toast.error('La sala está llena');
+          setIsLoading(false);
+          return null;
+        }
+
+        // Check if user is already in room
+        const isAlreadyInRoom = room.participants.some(p => p.id === user.id);
+        if (!isAlreadyInRoom) {
+          await RoomService.joinRoom(room.id, user.id);
+        }
+
+        // Refresh room data
+        const updatedRoom = await RoomService.getRoomById(room.id);
+        if (updatedRoom) {
+          setRooms(prev => {
+            const existingIndex = prev.findIndex(r => r.id === updatedRoom.id);
+            if (existingIndex >= 0) {
+              const newRooms = [...prev];
+              newRooms[existingIndex] = updatedRoom;
+              return newRooms;
+            } else {
+              return [updatedRoom, ...prev];
+            }
+          });
+          toast.success('¡Te has unido a la sala!');
+          setIsLoading(false);
+          return updatedRoom;
+        }
+      } else {
+        toast.error('Sala no encontrada o inactiva');
+      }
+    } catch (error) {
+      console.error('Error joining room:', error);
+      toast.error('Error al unirse a la sala');
+    }
+    setIsLoading(false);
+    return null;
   };

-  const joinRoom = (code: string) => {
-    if (!user) return null;
+  const leaveRoom = async (roomId: string) => {
+    if (!user) return;

-    // In a real implementation, this would query the backend
-    // For demo, we'll create a mock room
-    const mockRoom: Room = {
-      id: Math.random().toString(36).substr(2, 9),
-      name: `Sala ${code}`,
-      code,
-      hostId: 'host_id',
-      hostName: 'Usuario Host',
-      isActive: true,
-      participants: [
-        {
-          id: 'host_id',
-          name: 'Usuario Host',
-          email: 'host@example.com',
-          joinedAt: new Date(Date.now() - 300000),
-          isHost: true
-        },
-        {
-          id: user.id,
-          name: user.name,
-          email: user.email,
-          joinedAt: new Date(),
-          isHost: false
-        }
-      ],
-      createdAt: new Date(Date.now() - 300000),
-      maxParticipants: 10
-    };
+    try {
+      await RoomService.leaveRoom(roomId, user.id);
+      await loadUserRooms(); // Refresh rooms
+      toast.success('Has salido de la sala');
+    } catch (error) {
+      console.error('Error leaving room:', error);
+      toast.error('Error al salir de la sala');
+    }
+  };

-    return mockRoom;
+  const endRoom = async (roomId: string) => {
+    try {
+      await RoomService.endRoom(roomId);
+      setRooms(prev => prev.map(room =>
+        room.id === roomId ? { ...room, isActive: false } : room
+      ));
+      toast.success('Sala finalizada');
+    } catch (error) {
+      console.error('Error ending room:', error);
+      toast.error('Error al finalizar la sala');
+    }
   };

-  const endRoom = (roomId: string) => {
-    const updatedRooms = rooms.map(room =>
-      room.id === roomId
-        ? { ...room, isActive: false }
-        : room
-    );
-    saveRooms(updatedRooms);
+  const refreshRoom = async (roomId: string) => {
+    try {
+      const updatedRoom = await RoomService.getRoomById(roomId);
+      if (updatedRoom) {
+        setRooms(prev => prev.map(room =>
+          room.id === roomId ? updatedRoom : room
+        ));
+      }
+    } catch (error) {
+      console.error('Error refreshing room:', error);
+    }
   };

   return {
     rooms,
+    isLoading,
     createRoom,
     joinRoom,
-    endRoom
+    leaveRoom,
+    endRoom,
+    refreshRoom,
+    loadUserRooms,
   };
 };