import React, { useState } from 'react';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ScreenShareHost } from './components/ScreenShare/ScreenShareHost';
import { ScreenShareViewer } from './components/ScreenShare/ScreenShareViewer';
import { useAuth } from './hooks/useAuth';
import { useRooms } from './hooks/useRooms';
import { Room } from './types';

type AppState = 'login' | 'register' | 'dashboard' | 'hosting' | 'viewing';

function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  const { user, isLoading, error, login, register, logout, clearError } = useAuth();
  const { rooms, createRoom, joinRoom, endRoom } = useRooms(user);

  // Auto-navigate to dashboard when user logs in
  React.useEffect(() => {
    if (user && (appState === 'login' || appState === 'register')) {
      setAppState('dashboard');
    }
  }, [user, appState]);

  const handleLogin = async (email: string, password: string) => {
    clearError();
    await login(email, password);
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    clearError();
    await register(name, email, password);
  };

  const handleCreateRoom = (name: string, maxParticipants: number) => {
    const room = createRoom(name, maxParticipants);
    if (room) {
      setCurrentRoom(room);
      setAppState('hosting');
    }
  };

  const handleJoinRoom = (code: string) => {
    const room = joinRoom(code);
    if (room) {
      setCurrentRoom(room);
      setAppState('viewing');
    } else {
      alert('Sala no encontrada');
    }
  };

  const handleStartShare = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room && user && room.hostId === user.id) {
      setCurrentRoom(room);
      setAppState('hosting');
    } else if (room) {
      setCurrentRoom(room);
      setAppState('viewing');
    }
  };

  const handleEndShare = () => {
    if (currentRoom) {
      endRoom(currentRoom.id);
    }
    setCurrentRoom(null);
    setAppState('dashboard');
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setAppState('dashboard');
  };

  const handleLogout = () => {
    logout();
    setCurrentRoom(null);
    setAppState('login');
  };

  const toggleAuthMode = () => {
    setAppState(appState === 'login' ? 'register' : 'login');
  };

  if (appState === 'login') {
    return (
      <div>
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}
        <LoginForm
          onLogin={handleLogin}
          onToggleMode={toggleAuthMode}
          isLoading={isLoading}
        />
      </div>
    );
  }

  if (appState === 'register') {
    return (
      <div>
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}
        <RegisterForm
          onRegister={handleRegister}
          onToggleMode={toggleAuthMode}
          isLoading={isLoading}
        />
      </div>
    );
  }

  if (appState === 'dashboard' && user) {
    return (
      <Dashboard
        user={user}
        rooms={rooms}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onStartShare={handleStartShare}
        onLogout={handleLogout}
      />
    );
  }

  if (appState === 'hosting' && currentRoom && user) {
    return (
      <ScreenShareHost
        room={currentRoom}
        onEndShare={handleEndShare}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
        isAudioEnabled={isAudioEnabled}
      />
    );
  }

  if (appState === 'viewing' && currentRoom) {
    return (
      <ScreenShareViewer
        room={currentRoom}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">ScreenShare Pro</h1>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}

export default App;