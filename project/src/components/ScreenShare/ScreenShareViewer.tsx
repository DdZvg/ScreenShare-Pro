import React, { useRef, useEffect, useState } from 'react';
import { Monitor, Users, Maximize2, Phone, Volume2, VolumeX } from 'lucide-react';
import { Room } from '../../types';

interface ScreenShareViewerProps {
  room: Room;
  onLeaveRoom: () => void;
}

export const ScreenShareViewer: React.FC<ScreenShareViewerProps> = ({ room, onLeaveRoom }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [showParticipants, setShowParticipants] = useState(true);

  useEffect(() => {
    // In a real implementation, this would connect to the WebRTC stream
    // For demo purposes, we'll show a placeholder
    if (videoRef.current) {
      // Simulate receiving stream
      videoRef.current.poster = 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg';
      // Simulate connection after delay
      setTimeout(() => setConnectionStatus('connected'), 2000);
    }
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const participants = room.participants.filter(p => !p.isHost);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-6 h-6 text-green-500" />
              <div>
                <h1 className="font-semibold">{room.name}</h1>
                <p className="text-sm text-gray-300">
                  {connectionStatus === 'connected' ? 'Conectado' : 'Conectando...'} • {room.hostName}
                </p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              connectionStatus === 'connected' ? 'bg-green-600' : 'bg-yellow-600'
            }`}>
              <div className={`w-2 h-2 bg-white rounded-full ${
                connectionStatus === 'connected' ? 'animate-pulse' : 'animate-bounce'
              }`}></div>
              EN VIVO
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              <span>{room.participants.length} participantes</span>
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="ml-2 text-xs bg-gray-600 px-2 py-1 rounded"
              >
                {showParticipants ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-colors ${
                isMuted ? 'bg-red-600' : 'bg-gray-700'
              }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={onLeaveRoom}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Screen Share Area */}
        <div className={`bg-black flex items-center justify-center p-4 transition-all ${
          showParticipants ? 'flex-1' : 'w-full'
        }`}>
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              className="w-full h-full object-contain rounded-lg"
              poster="https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            />
            
            {/* Demo overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center text-white">
                {connectionStatus === 'connecting' ? (
                  <>
                    <div className="animate-spin w-16 h-16 border-4 border-gray-600 border-t-white rounded-full mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Conectando...</h3>
                    <p className="text-gray-300">Estableciendo conexión con {room.hostName}</p>
                  </>
                ) : (
                  <>
                    <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2">Vista de Pantalla Compartida</h3>
                    <p className="text-gray-300">
                      {room.hostName} está compartiendo su pantalla
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      (En implementación real, aquí se vería la pantalla en vivo)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Participants Panel */}
        {showParticipants && (
        <div className="w-80 bg-gray-800 text-white p-4 transition-all">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participantes ({room.participants.length})
          </h3>
          
          <div className="space-y-3">
            {/* Host */}
            <div className="flex items-center justify-between p-3 bg-blue-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-medium">
                  {room.hostName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{room.hostName}</p>
                  <p className="text-xs text-blue-200">Anfitrión</p>
                </div>
              </div>
              <Monitor className="w-4 h-4 text-blue-200" />
            </div>

            {/* Participants */}
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(participant.joinedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};