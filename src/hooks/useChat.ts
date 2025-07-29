import { useState, useEffect } from 'react';
import { Message } from '../types';
import { ChatService } from '../services/chatService';
import toast from 'react-hot-toast';

export const useChat = (roomId: string | null, userId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (roomId) {
      loadMessages();
      
      // Subscribe to new messages
      const subscription = ChatService.subscribeToMessages(roomId, (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [roomId]);

  const loadMessages = async () => {
    if (!roomId) return;
    
    setIsLoading(true);
    try {
      const roomMessages = await ChatService.getRoomMessages(roomId);
      setMessages(roomMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Error al cargar mensajes');
    }
    setIsLoading(false);
  };

  const sendMessage = async (content: string) => {
    if (!roomId || !userId || !content.trim()) return;

    try {
      await ChatService.sendMessage(roomId, userId, content.trim());
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar mensaje');
    }
  };

  const sendSystemMessage = async (content: string) => {
    if (!roomId || !userId) return;

    try {
      await ChatService.sendMessage(roomId, userId, content, 'system');
    } catch (error) {
      console.error('Error sending system message:', error);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    sendSystemMessage,
  };
};