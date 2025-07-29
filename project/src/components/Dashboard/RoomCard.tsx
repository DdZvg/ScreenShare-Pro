import React from 'react';
import { QrCode, Share2, Users, Clock, Play } from 'lucide-react';
import { Room } from '../../types';

interface RoomCardProps {
  room: Room;
  onShowQR: () => void;
  onStartShare: () => void;
  isActive: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onShowQR, onStartShare, isActive }) => {
  const formatDate = (date: Date) => {
    // Validación adicional para fechas
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Fecha no válida';
    }
    
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeAgo = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
      isActive ? 'border-green-200 bg-green-50/50' : 'border-gray-100'
    }`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{room.name}</h3>
            <p className="text-sm text-gray-600">Por {room.hostName}</p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isActive ? 'Activa' : 'Finalizada'}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{room.participants.length}/{room.maxParticipants}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span title={formatDate(room.createdAt)}>
              {getTimeAgo(room.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onShowQR}
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            QR
          </button>
          
          <button
            onClick={onStartShare}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              isActive
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isActive ? <Share2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? 'Compartir' : 'Reactivar'}
          </button>
        </div>
      </div>
    </div>
  );
};