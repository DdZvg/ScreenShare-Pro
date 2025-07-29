import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Smile, Paperclip } from 'lucide-react';
import { Message, User } from '../../types';
import { useChat } from '../../hooks/useChat';

interface ChatPanelProps {
  roomId: string;
  user: User;
  isVisible: boolean;
  onToggle: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ roomId, user, isVisible, onToggle }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { messages, sendMessage } = useChat(roomId, user.id);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hoy';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }
    
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
    }).format(messageDate);
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const dateKey = message.createdAt.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return Object.entries(groups).map(([dateKey, msgs]) => ({
      date: new Date(dateKey),
      messages: msgs,
    }));
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Chat</h3>
        </div>
        <button
          onClick={onToggle}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupMessagesByDate(messages).map(({ date, messages: dayMessages }) => (
          <div key={date.toISOString()}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {formatDate(date)}
              </div>
            </div>
            
            {/* Messages for this date */}
            {dayMessages.map((message) => (
              <div key={message.id} className="mb-3">
                {message.messageType === 'system' ? (
                  <div className="text-center">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {message.content}
                    </span>
                  </div>
                ) : (
                  <div className={`flex ${message.userId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs ${
                      message.userId === user.id
                        ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg'
                        : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
                    } px-3 py-2`}>
                      {message.userId !== user.id && (
                        <div className="text-xs font-medium mb-1 opacity-75">
                          {message.userName}
                        </div>
                      )}
                      <div className="text-sm">{message.content}</div>
                      <div className={`text-xs mt-1 opacity-75 ${
                        message.userId === user.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay mensajes aún</p>
            <p className="text-xs mt-1">¡Sé el primero en escribir!</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              maxLength={500}
            />
          </div>
          
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Smile className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};