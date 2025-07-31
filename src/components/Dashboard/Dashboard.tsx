import React, { useState } from 'react';
import { Plus, Users, Monitor, Settings, LogOut, Search } from 'lucide-react';
import { Room, User } from '../../types';
import { RoomCard } from './RoomCard';
import { CreateRoomModal } from './CreateRoomModal';
import { QRCodeModal } from './QRCodeModal';

interface DashboardProps {
  user: User;
  rooms: Room[];
  isLoading: boolean;
  onCreateRoom: (name: string, maxParticipants: number) => void;
  onJoinRoom: (code: string) => void;
  onStartShare: (roomId: string) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  rooms,
  isLoading,
  onCreateRoom,
  onJoinRoom,
  onStartShare,
  onLogout
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Filtrado mejorado
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.hostName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && room.isActive) ||
                         (filterActive === 'inactive' && !room.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const activeRooms = filteredRooms.filter(room => room.isActive);
  const pastRooms = filteredRooms.filter(room => !room.isActive);

  const handleShowQR = (room: Room) => {
    setSelectedRoom(room);
    setShowQRModal(true);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      onJoinRoom(joinCode.trim());
      setJoinCode('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">ScreenShare Pro</h1>
              </div>
            </div>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando salas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">ScreenShare Pro</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-medium text-blue-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span>Hola, {user.name}</span>
              </div>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Crear Nueva Sala</h2>
            <p className="text-gray-600 mb-4">
              Inicia una nueva sesión de compartir pantalla
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              Crear Sala
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Unirse a Sala</h2>
            <form onSubmit={handleJoinSubmit}>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Ingresa el código de sala"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Users className="w-5 h-5" />
                Unirse
              </button>
            </form>
          </div>
        </div>

        {/* Búsqueda y filtros */}
        {rooms.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar salas..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterActive('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterActive === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterActive('active')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterActive === 'active' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Activas
                </button>
                <button
                  onClick={() => setFilterActive('inactive')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterActive === 'inactive' 
                      ? 'bg-gray-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Finalizadas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Rooms */}
        {activeRooms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Salas Activas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onShowQR={() => handleShowQR(room)}
                  onStartShare={() => onStartShare(room.id)}
                  isActive={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Rooms */}
        {pastRooms.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastRooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onShowQR={() => handleShowQR(room)}
                  onStartShare={() => onStartShare(room.id)}
                  isActive={false}
                />
              ))}
            </div>
          </div>
        )}

        {filteredRooms.length === 0 && rooms.length > 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron salas
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta con otros términos de búsqueda o filtros
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterActive('all');
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        )}

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes salas aún
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primera sala para comenzar a compartir tu pantalla
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Crear Primera Sala
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreateRoom={onCreateRoom}
        />
      )}

      {showQRModal && selectedRoom && (
        <QRCodeModal
          room={selectedRoom}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
};