import React, { useRef, useEffect, useState } from 'react';
import { Monitor, Users, Maximize2, Phone, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { Room, User } from '../../types';
import { ChatPanel } from '../Chat/ChatPanel';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useChat } from '../../hooks/useChat';
import toast from 'react-hot-toast';

interface ScreenShareViewerProps {
  room: Room;
  user: User;
  onLeaveRoom: () => void;
}

export const ScreenShareViewer: React.FC<ScreenShareViewerProps> = ({ 
  room, 
  user, 
  onLeaveRoom 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const { isAudioEnabled, toggleAudio } = useWebRTC();
  const { sendSystemMessage } = useChat(room.id, user.id);

  useEffect(() => {
    // Simulate connection to host's stream
    const timer = setTimeout(() => {
      setConnectionStatus('connected');
      if (videoRef.current) {
        // In a real implementation, this would be the actual stream from the host
        videoRef.current.poster = 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg';
      }
    }, 2000);

    // Send join message
    sendSystemMessage(`${user.name} se unió a la sala`);

    return () => {
      clearTimeout(timer);
      // Send leave message when component unmounts
      sendSystemMessage(`${user.name} salió de la sala`);
    };
  }, []);

  const handleToggleAudio = async () => {
    try {
      toggleAudio();
      const message = isAudioEnabled 
        ? `${user.name} desactivó su micrófono`
        : `${user.name} activó su micrófono`;
      await sendSystemMessage(message);
    } catch (error) {
      toast.error('Error al cambiar audio');
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await sendSystemMessage(`${user.name} salió de la sala`);
      onLeaveRoom();
    } catch (error) {
      onLeaveRoom();
    }
  };

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
  const host = room.participants.find(p => p.isHost);

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

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm mr-4">
              <Users className="w-4 h-4" />
              <span>{room.participants.length} participantes</span>
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="ml-2 text-xs bg-gray-600 px-2 py-1 rounded hover:bg-gray-500 transition-colors"
              >
                {showParticipants ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            
            <button
              onClick={handleToggleAudio}
              className={`p-2 rounded-lg transition-colors ${
                isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleLeaveRoom}
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
              {host && (
                <div className="flex items-center justify-between p-3 bg-blue-600 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-medium">
                      {host.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{host.name}</p>
                      <p className="text-xs text-blue-200">Anfitrión</p>
                    </div>
                  </div>
                  <Monitor className="w-4 h-4 text-blue-200" />
                </div>
              )}

              {/* Current User */}
              <div className="flex items-center justify-between p-3 bg-green-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{user.name} (Tú)</p>
                    <p className="text-xs text-green-200">Participante</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isAudioEnabled && <Mic className="w-4 h-4 text-green-200" />}
                </div>
              </div>

              {/* Other Participants */}
              {participants.filter(p => p.id !== user.id).map((participant) => (
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

      {/* Chat Panel */}
      <ChatPanel
        roomId={room.id}
        user={user}
        isVisible={showChat}
        onToggle={() => setShowChat(!showChat)}
      />
    </div>
  );
};