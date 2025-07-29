@@ .. @@
 export interface User {
   id: string;
   email: string;
   name: string;
   avatar?: string;
   createdAt: Date;
 }

 export interface Room {
   id: string;
   name: string;
   code: string;
   hostId: string;
   hostName: string;
   isActive: boolean;
   participants: Participant[];
   createdAt: Date;
   maxParticipants: number;
 }

 export interface Participant {
   id: string;
   name: string;
   email: string;
   avatar?: string;
   joinedAt: Date;
   isHost: boolean;
 }

+export interface Message {
+  id: string;
+  roomId: string;
+  userId: string;
+  userName: string;
+  userAvatar?: string;
+  content: string;
+  messageType: 'text' | 'system' | 'file';
+  createdAt: Date;
+}
+
+export interface MediaSettings {
+  video: boolean;
+  audio: boolean;
+  screen: boolean;
+  quality: 'low' | 'medium' | 'high';
+}
+
+export interface RoomSettings {
+  allowChat: boolean;
+  allowAudio: boolean;
+  allowScreenShare: boolean;
+  maxParticipants: number;
+  isPublic: boolean;
+}

 export interface InviteLink {
   roomId: string;
   code: string;
   expiresAt: Date;
 }